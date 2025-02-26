import Database from "better-sqlite3";
import crypto from 'crypto';

// 创建数据库连接
const db = new Database('cdkeys.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS cdkeys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cdkey TEXT NOT NULL UNIQUE,   -- 添加cdkey字段，唯一索引，不允许重复，就是卡密
    seed TEXT NOT NULL, -- 添加seed字段，用于生成cdkey的种子，即为加密
    uses INTEGER NOT NULL, -- 添加uses字段，表示使用次数上限
    is_used INTEGER DEFAULT 0, -- 新增字段，是否已使用，0表示未使用，1表示已使用，默认为0
    actual_uses INTEGER DEFAULT 0,  -- 新增字段，实际使用次数
    used_at TEXT DEFAULT '[]', -- 新增字段，使用时间，默认为空数组，用于记录使用时间，时间戳
    release_count INTEGER DEFAULT 0, -- 新增字段，释放次数，默认为0
    release_at TEXT DEFAULT '[]', -- 新增字段，释放时间，默认为空数组，用于记录释放时间，时间戳
    generated_at INTEGER DEFAULT (strftime('%s', 'now')),  -- 修改为时间戳
    special INTEGER DEFAULT 0, -- 新增字段，是否是特殊卡，0表示普通卡，1表示特殊卡，默认为0
    project_id TEXT, -- 新增字段，项目ID，用于特殊卡绑定项目。特殊卡为1时必填
    phone TEXT DEFAULT '[]',  -- 修改为JSON数组，默认为空数组
    phone_for_two_uses TEXT -- 新增字段，当uses使用上限为2时使用，第一次取号时未释放，下次默认从此处phone取号
  );
`);

/**
 * 生成指定数量的 CdKey
 * @param {string} seed - 种子
 * @param {number} uses - 使用次数
 * @param {number} count - 生成数量
 * @param {number} special - 是否是特殊卡
 * @returns {Array} 生成的 CdKey 数组
 * 
 */
function generateCdKeys(seed, uses, count) {
  if (typeof seed !== 'string' || typeof uses !== 'number' || typeof count !== 'number') {
    throw new Error('Invalid input types');
  }
  if (uses <= 0 || count <= 0) {
    throw new Error('Uses and count must be greater than 0');
  }
  if (uses > 2) {
    throw new Error('每张卡使用上限为2');
  }

  const cdKeys = [];
  for (let i = 0; i < count; i++) {
    let cdKey;
    do {
      const hash = crypto.createHash('sha256');
      hash.update(seed + i + Math.random().toString()); // 增加随机性
      cdKey = hash.digest('hex').substring(0, 32); // 确保 32 位以内
    } while (isCdKeyExists(cdKey)); // 检查 cdkey 是否已存在
    cdKeys.push(cdKey);
  }
  return cdKeys;
}


function isCdKeyExists(cdKey) {
  const stmt = db.prepare('SELECT 1 FROM cdkeys WHERE cdkey = ?');
  const result = stmt.get(cdKey);
  return result !== undefined;
}

/**
 * 插入 CdKey 到数据库
 * @param {string} cdKey - CdKey
 * @param {string} seed - 种子
 * @param {number} uses - 使用次数
 * @param {number} special - 是否是特殊卡
 * @param {string} project_id - 项目ID
 */
function insertCdKey(cdKey, seed, uses, special, project_id) {
  if (typeof cdKey !== 'string' || typeof seed !== 'string' || typeof uses !== 'number' || typeof special !== 'number') {
    throw new Error('Invalid input types');
  }
  if (uses <= 0) {
    throw new Error('Uses must be greater than 0');
  }
  if (uses > 2) {
    throw new Error('每张卡使用上限为2');
  }

  // 根据 special 值设置 project_id
  let projectId = null;
  if (special === 1 && typeof project_id === 'string') {
    projectId = project_id;
  }

  const stmt = db.prepare(`INSERT INTO cdkeys (cdkey, seed, uses, actual_uses, is_used, used_at, special, project_id) VALUES (?, ?, ?, 0, 0, NULL, ?, ?)`); // 初始化 actual_uses 为 0
  stmt.run(cdKey, seed, uses, special, projectId);
}
/**
 * 生成并插入 CdKey
 * @param {string} seed - 种子
 * @param {number} uses - 使用次数
 * @param {number} count - 生成数量
 * @param {number} special - 是否是特殊卡
 * @param {string} project_id - 项目ID
 */
function generateAndInsertCdKeys(seed, uses, count, special, project_id) { // 新增project_id参数
  try {
    const cdKeys = generateCdKeys(seed, uses, count);
    cdKeys.forEach(cdKey => insertCdKey(cdKey, seed, uses, special, project_id));
  } catch (error) {
    console.error('Error:', error);
  }
}

// 示例调用
generateAndInsertCdKeys('myseed', 2, 10, 1, '10675----1OTQM6');


// 关闭数据库连接
// db.close();
export { generateAndInsertCdKeys };
import { createSlice } from '@reduxjs/toolkit'

const defaultCollapse = JSON.parse(localStorage.getItem('sideCollapsed') || false)
const defaultSelectedKeys = [localStorage.getItem('selectKeys') || '/m/homepage']
const defaultOpenKeys = JSON.parse(localStorage.getItem('openKeys') || '[]')


const menuSlice = createSlice({
  name: 'menu',
  initialState: {
    menuList: [
      { label: '首页', key: '/m/homepage', icon: 'HomeOutlined' },
      { label: '专业能力图谱', key: '/m/gaseousPhase', icon: 'OrderedListOutlined' },
      { label: '职位胜任力图谱', key: '/m/liquidPhase', icon: 'OrderedListOutlined' },
      { label: '图谱对比', key: '/m/comboPhase', icon: 'OrderedListOutlined' }
    ],
    collapsed: defaultCollapse,
    selectKeys: defaultSelectedKeys,
    openKeys: defaultOpenKeys
  },
  reducers: {
    toggleMenu: (state) => {
      state.collapsed = !state.collapsed
      localStorage.setItem('sideCollapsed', state.collapsed)
    },
    setSelectKeys: (state, action) => {
      state.selectKeys = [action.payload]
    }
  }
})

export const {
  toggleMenu,
  setSelectKeys
} = menuSlice.actions

export default menuSlice.reducer
import { Message } from 'element-ui'
import {
  initGlobalState
} from 'qiankun'

const TYPES = {
  INIT_APPS: 'init_apps'
}

export const state = () => ({
  apps: [],
  name: 'main',
  sdk: null
})

export const mutations = {
  [TYPES.INIT_APPS] (state, apps){
    // 初始化全局变量
    const actions = initGlobalState({
      name: state.name
    })

    // 使用 sdk 方式进行 父子应用通信, 这里大家可以根据自己项目进行增加删除
    const sdk = {
      globalState: actions,
      toast: (...args) => {
        Message(...args)
      },
      router: {
        push: (...args) => {
          this.$router.push(...args)
        },
        replace: (...args) => {
          this.$router.replace(...args)
        },
        resolve: (...args) => {
          this.$router.resolve(...args)
        }
      },
      store: {
        dispatch: (...args) => {
          this.dispatch(...args)
        },
        commit: (...args) => {
          this.commit(...args)
        },
        state: { ...this.state }
      },
      name: state.name
    }

    // 处理 apps 列表
    apps = apps.map((item) => {
      return {
        ...item,
        container: '#subapp',
        props: {
          sdk
        }
      }
    })

    // 处理路由表
    const routes = []
    apps.forEach((item, i) => {
      if (Array.isArray(item.activeRule)) {
        routes.push(...item.activeRule.map(i => ({
          path: `${i.slice(1)}`,
          name: `${item.name}${i}`,
          component: () => import('@/pages/spa.vue').then(m => m.default || m)
        })))
        return false
      }
      routes.push({
        path: `${item.activeRule.slice(1)}`,
        name: `${item.name}-i`,
        component: () => import('@/pages/spa.vue').then(m => m.default || m)
      })
    })

    // 动态增加路由, 这里要注意 404 页面不能直接写在 pages 中
    // 不然匹配的时候会根据顺序匹配到 * 就直接返回了 从而匹配不到我们后续添加的动态路由
    // console.log(routes)
    this.$router.addRoutes([].concat(...routes,
      {
        path: '404',
        name: 404,
        component: () => import('~/layouts/error.vue').then(m => m.default || m)
      }
    ))

    state.apps = apps
    state.sdk = sdk
  }
}

export const actions = {
  async getMenus ({ commit }) {
    const { payload } = await getMenus()
    commit(TYPES.INIT_APPS, payload)
  }
}

function getMenus () {
  return {
    code: 200,
    payload: [
      {
        name: 'subapp',
        container: '#subapp',
        activeRule: '/about',
        entry: '//localhost:3005', // 解决不同服务器和域名
        props: {
          msg: '我是主应用main' // 主应用向微应用传递参数
        }
      }
    ],
    message: 'success'
  }
}

import Taro from '@tarojs/taro'
import { API_BASE_URL, MAX_RETRIES } from './config'

// ========================================
// 统一网络请求层 — 支持重试、Loading、错误提示
// ========================================

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, any>
  header?: Record<string, string>
  showLoading?: boolean
  loadingText?: string
  retries?: number
  silent?: boolean
}

export const request = <T = any>(options: RequestOptions): Promise<T> => {
  const {
    url, method = 'GET', data, header = {},
    showLoading = false, loadingText = '加载中...',
    retries = 0, silent = false,
  } = options

  return new Promise((resolve, reject) => {
    const token = Taro.getStorageSync('token')

    if (showLoading) {
      Taro.showLoading({ title: loadingText, mask: true })
    }

    Taro.request({
      url: API_BASE_URL + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        Authorization: token ? 'Bearer ' + token : '',
        ...header,
      },
      success: (res) => {
        if (showLoading) Taro.hideLoading()
        if (res.statusCode === 200) {
          resolve(res.data as T)
        } else if (res.statusCode === 401) {
          Taro.removeStorageSync('token')
          Taro.navigateTo({ url: '/sp-common/pages/verify/index' })
          reject(new Error('登录已过期，请重新认证'))
        } else {
          const errMsg = (res.data as any)?.message || '请求失败'
          if (!silent) Taro.showToast({ title: errMsg, icon: 'none', duration: 2000 })
          reject(new Error(errMsg))
        }
      },
      fail: () => {
        if (showLoading) Taro.hideLoading()
        if (retries < MAX_RETRIES) {
          const delay = Math.min(1000 * Math.pow(2, retries), 4000)
          setTimeout(() => {
            request<T>({ ...options, retries: retries + 1 }).then(resolve).catch(reject)
          }, delay)
        } else {
          const errMsg = '网络异常，请检查网络连接'
          if (!silent) Taro.showToast({ title: errMsg, icon: 'none' })
          reject(new Error(errMsg))
        }
      },
    })
  })
}

export const get = <T = any>(url: string, data?: Record<string, any>, options?: Partial<RequestOptions>) =>
  request<T>({ url: url, method: 'GET', data: data, ...options })

export const post = <T = any>(url: string, data?: Record<string, any>, options?: Partial<RequestOptions>) =>
  request<T>({ url: url, method: 'POST', data: data, ...options })

export const put = <T = any>(url: string, data?: Record<string, any>, options?: Partial<RequestOptions>) =>
  request<T>({ url: url, method: 'PUT', data: data, ...options })

export const del = <T = any>(url: string, data?: Record<string, any>, options?: Partial<RequestOptions>) =>
  request<T>({ url: url, method: 'DELETE', data: data, ...options })


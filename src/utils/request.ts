import Taro from '@tarojs/taro'

const BASE_URL = 'https://api.example.com'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, any>
  header?: Record<string, string>
  showLoading?: boolean
}

export const request = <T = any>(options: RequestOptions): Promise<T> => {
  const { url, method = 'GET', data, header = {}, showLoading = false } = options

  return new Promise((resolve, reject) => {
    const token = Taro.getStorageSync('token')

    if (showLoading) {
      Taro.showLoading({ title: '加载中...', mask: true })
    }

    Taro.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...header,
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data as T)
        } else if (res.statusCode === 401) {
          // Token expired, re-login
          Taro.removeStorageSync('token')
          Taro.navigateTo({ url: '/pages/verify/index' })
          reject(new Error('登录已过期，请重新认证'))
        } else {
          reject(new Error((res.data as any)?.message || '请求失败'))
        }
      },
      fail: () => {
        reject(new Error('网络异常，请检查网络连接'))
      },
      complete: () => {
        if (showLoading) {
          Taro.hideLoading()
        }
      },
    })
  })
}

export const get = <T = any>(url: string, data?: Record<string, any>) =>
  request<T>({ url, method: 'GET', data })

export const post = <T = any>(url: string, data?: Record<string, any>) =>
  request<T>({ url, method: 'POST', data })

export const put = <T = any>(url: string, data?: Record<string, any>) =>
  request<T>({ url, method: 'PUT', data })

export const del = <T = any>(url: string, data?: Record<string, any>) =>
  request<T>({ url, method: 'DELETE', data })

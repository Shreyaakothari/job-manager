import { MutationTree } from 'vuex'
import UserState from './UserState'
import * as types from './mutation-types'

const mutations: MutationTree <UserState> = {
    [types.USER_TOKEN_CHANGED] (state, payload) {
        state.token = payload.newToken
    },
    [types.USER_END_SESSION] (state) {
      state.token = ''
      state.current = null
      state.currentShopifyConfig = {}
      state.currentEComStore = {
        productStoreId: "",
        storeName: "None"
      }
      state.shopifyConfigs = []
    },
    [types.USER_INFO_UPDATED] (state, payload) {
        state.current = payload
    },
    [types.USER_INSTANCE_URL_UPDATED] (state, payload) {
        state.instanceUrl = payload;
    },
    [types.USER_CURRENT_SHOPIFY_CONFIG_UPDATED] (state, payload) {
        state.currentShopifyConfig = payload;
    },
    [types.USER_SHOPIFY_CONFIGS_UPDATED] (state, payload) {
        state.shopifyConfigs = payload
    },
    [types.USER_CURRENT_ECOM_STORE_UPDATED] (state, payload) {
        state.currentEComStore = payload;
    }
}
export default mutations;

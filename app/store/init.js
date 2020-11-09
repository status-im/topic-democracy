import store from './configureStore'
import { fetchAndDispatchAccountsWithBalances } from '../actions/accounts'

const dispatch = action => store.dispatch(action)

export default () => {
  __embarkContext.execWhenReady(async () => {
    fetchAndDispatchAccountsWithBalances(web3, dispatch)
  })
}

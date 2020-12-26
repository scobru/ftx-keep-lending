const FTXRest = require('ftx-api-rest')
const CronJob = require('cron').CronJob
const dotenv = require('dotenv')
dotenv.config()

const ftx = new FTXRest({
  key: process.env.FTX_API_KEY,
  secret: process.env.FTX_API_SECRET,
  subaccount: process.env.FTX_SUB_ACCOUNT,
})

const getFreeBalanceAndLending = async (coin = 'USD') => {
  try {
    const getBalancesResult = await ftx.request({
      method: 'GET',
      path: '/wallet/balances',
    })

    const { free, total } = getBalancesResult?.result?.find((item) => item.coin === 'USD') || {}
    console.log(new Date(), 'freeBalance', free, 'totalBalance', total)

    if (total > 0) {
      const offersResult = await ftx.request({
        method: 'POST',
        path: '/spot_margin/offers',
        data: {
          coin: coin,
          size: total,
          rate: 0.000005, // (4.38% / year)
        },
      })

      console.log(new Date(), 'offersResult', offersResult)
    }
  } catch (e) {
    console.log(e.message)
  }
}

const job = new CronJob('7 * * * *', function () {
  getFreeBalanceAndLending()
})
job.start()
getFreeBalanceAndLending()

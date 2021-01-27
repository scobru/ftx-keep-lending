const FTXRest = require('ftx-api-rest')
const CronJob = require('cron').CronJob
const dotenv = require('dotenv')
dotenv.config()

const ftx = new FTXRest({
  key: process.env.FTX_API_KEY,
  secret: process.env.FTX_API_SECRET,
  subaccount: process.env.FTX_SUB_ACCOUNT,
})

const roundDown6DecimalPlaces = (number) =>
  Math.floor((number + Number.EPSILON) * 1000000) / 1000000

const getFreeBalanceAndLending = async (coins) => {
  try {
    const getBalancesResult = await ftx.request({
      method: 'GET',
      path: '/wallet/balances',
    })

    for (const coin of coins) {
      const { free, total } = getBalancesResult?.result?.find((item) => item.coin === coin) || {}
      const fixTotal = roundDown6DecimalPlaces(total)
      console.log(new Date(), coin, 'freeBalance', free, 'totalBalance', total, '=>', fixTotal)

      if (total > 0) {
		  getLendingRate =  await ftx.request({
          method: 'GET',
          path: '/spot_margin/lending_rates',
     
        })
	
		getLendingRate = getLendingRate['result']

		   

		for (i = 0; i < 40; i++) {
			 
	  		if (getLendingRate[i]['coin'] == coin){
				coinRate = getLendingRate[i]['estimate'] 
					const offersResult = await ftx.request({
	          			method: 'POST',
	          			path: '/spot_margin/offers',
	          			data: {
	            				coin: coin,
	            				size: fixTotal,
	            				rate: coinRate, // minimun hourly rate => (4.38% / year)
	          			},
	        		})

	        	console.log(new Date(), 'offersResult', offersResult, fixTotal)
	       	}

			}
		
	}
	}
	    
  } catch (e) {
    console.log(e.message)
  }
}

let leading_coins = ['USD']
if (process.env.LENDING_COIN) {
  leading_coins = process.env.LENDING_COIN.split(',')
}

console.log('Before job instantiation')
const job = new CronJob('30 * * * * *', function()  {
  getFreeBalanceAndLending(leading_coins)
})
console.log('After job instantiation')
getFreeBalanceAndLending(leading_coins)

job.start()

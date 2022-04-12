const Web3 = require('web3')
// const web3 = new Web3('wss://bsc-ws-node.nariox.org:443')
// const CALO_TOKEN = '0xb6b91269413b6B99242B1c0Bc611031529999999'
// const PANCAKE_ROUTER = '0x10ED43C718714eb63d5aA57B78B54704E256024E'
// const CALO_LP = '0x67Fb2B10BbDf1bA476d19bc983948fd50c409642'
const web3 = new Web3(
    'wss://speedy-nodes-nyc.moralis.io/a6604886500c496b643c8a41/bsc/testnet/ws'
)
const gasPrice = '10000000000'
const privateKey = '50b8214925fc7c6ebd20cf91083b7f73abba4496efb9db4df9d26c2aaa5a9f38'
const { ERC20_ABI, PANCAKE_LP_ABI, PANCAKE_ROUTER_ABI } = require('./const')
const WBNB = '0xae13d989dac2f0debff460ac112a837c89baa7cd'

const USDT = '0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684'
const CALO_TOKEN = '0x8185d09C7400adC9Ebfb08430B03cddC0A18DBA0'
const PANCAKE_ROUTER = '0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3'
const CALO_LP = '0xbd7E9e30e0509eEeA1C9a4d8B2A9F78ED8d48175'
const USDT_LP = '0xF855E52ecc8b3b795Ac289f85F6Fd7A99883492b'

const slipage = 0.05
const APPROVE_AMOUNT = '1000000000000000000000000000'

const USDT_CONTRACT = new web3.eth.Contract(ERC20_ABI, USDT)
const pancakeRouter = new web3.eth.Contract(PANCAKE_ROUTER_ABI, PANCAKE_ROUTER)
const caloLP = new web3.eth.Contract(PANCAKE_LP_ABI, CALO_LP)
let account = web3.eth.accounts.privateKeyToAccount(privateKey)
web3.eth.accounts.wallet.add(account)

console.log(account.address)

// approve(USDT_CONTRACT)
// swapBNBForExactTokens(web3.utils.toWei('5', 'ether'), [WBNB, CALO_TOKEN])
// swapBNBForExactTokens(web3.utils.toWei('5', 'ether'), [WBNB, USDT])
// swapExactBNBForTokens(web3.utils.toWei('0.005', 'ether'), [WBNB, CALO_TOKEN])
// swapExactTokensForBNB(web3.utils.toWei('5', 'ether'), [CALO_TOKEN, WBNB])
// swapTokensForExactETH(web3.utils.toWei('0.005', 'ether'), [USDT, WBNB])
// swapExactTokensForTokens(web3.utils.toWei('5', 'ether'), [CALO_TOKEN, WBNB, USDT])
swapTokensForExactTokens(web3.utils.toWei('5', 'ether'), [CALO_TOKEN, WBNB, USDT])


async function approve(token) {
    console.log(
        `Approving token to pancake router`
    )
    const res = await token.methods.approve(PANCAKE_ROUTER, APPROVE_AMOUNT).send({
        from: account.address,
        gas: 400000
    })
    console.log(
        'Tx hash: ' +
        res.transactionHash +
        '\n----------------------------------------------------------------------------------------'
    )
}

async function swapBNBForExactTokens(amountOut, path) {
    const maxAmountBNBIn = ((await getAmountIn(path, amountOut)) * (1 + slipage)).toString();
    console.log(
        `Swapping maximum ${web3.utils.fromWei(maxAmountBNBIn)} BNB for ${web3.utils.fromWei(amountOut)} tokens`
    )
    const res = await pancakeRouter.methods
        .swapETHForExactTokens(
            amountOut, path,
            account.address,
            parseInt(Date.now() / 1000) + 600
        )
        .send({
            from: account.address,
            gas: 400000,
            value: maxAmountBNBIn,
        })
    console.log(
        'Tx hash: ' +
        res.transactionHash +
        '\n----------------------------------------------------------------------------------------'
    )
}



async function swapExactBNBForTokens(amountIn, path) {
    const minAmountTokenOut = ((await getamountOut(path, amountIn)) * (1 - slipage)).toString();
    console.log(
        `Swapping ${web3.utils.fromWei(amountIn)} BNB for at least ${web3.utils.fromWei(minAmountTokenOut)} tokens`
    )
    const res = await pancakeRouter.methods
        .swapExactETHForTokens(
            minAmountTokenOut, path,
            account.address,
            parseInt(Date.now() / 1000) + 600
        )
        .send({
            from: account.address,
            gas: 400000,
            value: amountIn,
        })
    console.log(
        'Tx hash: ' +
        res.transactionHash +
        '\n----------------------------------------------------------------------------------------'
    )
}

async function swapExactTokensForBNB(amountIn, path) {
    const mintAmountBNBOut = ((await getamountOut(path, amountIn)) * (1 - slipage)).toString();
    console.log(
        `Swapping ${web3.utils.fromWei(amountIn)} tokens for at least ${web3.utils.fromWei(mintAmountBNBOut)} BNB`
    )
    const res = await pancakeRouter.methods.swapExactTokensForETH(
        amountIn,
        mintAmountBNBOut,
        path,
        account.address,
        parseInt(Date.now() / 1000) + 600
    ).send({
        from: account.address,
        gas: 400000
    })
    console.log(
        'Tx hash: ' +
        res.transactionHash +
        '\n----------------------------------------------------------------------------------------'
    )
}

async function swapTokensForExactETH(amountBNBOut, path) {
    const maxAmountTokenIn = (await getAmountIn(path, amountBNBOut) * (1 + slipage)).toString()
    console.log(
        `Swapping maximum ${web3.utils.fromWei(maxAmountTokenIn)} tokens for ${web3.utils.fromWei(amountBNBOut)} BNB`
    )
    const res = await pancakeRouter.methods.swapTokensForExactETH(
        amountBNBOut,
        maxAmountTokenIn,
        path,
        account.address,
        parseInt(Date.now() / 1000) + 600
    ).send({
        from: account.address,
        gas: 400000
    })

    console.log(
        'Tx hash: ' +
        res.transactionHash +
        '\n----------------------------------------------------------------------------------------'
    )
}

async function swapExactTokensForTokens(amountIn, path) {
    const minAmountTokenOut = ((await getamountOut(path, amountIn)) * (1 - slipage)).toString();
    console.log(
        `Swapping ${web3.utils.fromWei(amountIn)} tokens for at least ${web3.utils.fromWei(minAmountTokenOut)} tokens`
    )
    const res = await pancakeRouter.methods.swapExactTokensForTokens(
        amountIn,
        minAmountTokenOut,
        path,
        account.address,
        parseInt(Date.now() / 1000) + 600
    ).send({
        from: account.address,
        gas: 400000
    })
    console.log(
        'Tx hash: ' +
        res.transactionHash +
        '\n----------------------------------------------------------------------------------------'
    )
}

async function swapTokensForExactTokens(amountOut, path) {
    const maxAmounttIn = (await getAmountIn(path, amountOut) * (1 + slipage)).toString();
    console.log(
        `Swapping maximum ${web3.utils.fromWei(maxAmounttIn)} tokens for ${web3.utils.fromWei(amountOut)} tokens`
    )
    const res = await pancakeRouter.methods.swapTokensForExactTokens(
        amountOut,
        maxAmounttIn,
        path,
        account.address,
        parseInt(Date.now() / 1000) + 600
    ).send({
        from: account.address,
        gas: 400000
    })
    console.log(
        'Tx hash: ' +
        res.transactionHash +
        '\n----------------------------------------------------------------------------------------'
    )
}

async function getAmountIn(path, amountOut) {
    let res = await pancakeRouter.methods.getAmountsIn(amountOut, path).call()
    return parseInt(res[0])
}

async function getamountOut(path, amountIn) {
    let res = await pancakeRouter.methods.getAmountsOut(amountIn, path).call()
    console.log(res)
    return parseInt(res[res.length - 1])
}

import { ethers,utils } from "ethers";
import cake from "./cakeswap.js"
import coin from "./coin.js"
import irc20Abi from "./erc20Abi.js"
import log from "loglevel"
import {keccak256} from "@ethersproject/solidity"

log.setLevel('debug')

const BSC_RPC = 'https://bsc.mytokenpocket.vip'
const provider = new ethers.providers.JsonRpcProvider(BSC_RPC)

function getRouter(_provider){
const router = new ethers.Contract(
    cake.router_add,
    [
        'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
        'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
        'function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
        'function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline) external  payable returns (uint[] memory amounts)',
        'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
        'function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
        'function swapExactTokensForETHSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external'
    ],
    _provider 
)
return router
}



function getCakePair(token0, token1){
    const [tokenA, tokenB] = token0 < token1 ? [token0, token1] :[token1, token0]

    return utils.getCreate2Address(
        cake.factory_add,
        utils.keccak256(utils.solidityPack(['bytes'], [utils.solidityPack(['address', 'address'], [tokenA, tokenB])] )),
        // keccak256(['bytes'], [utils.solidityPack(['address', 'address'], [tokenA, tokenB])]),
        cake.salt
    )
}


async function swapAnlalyze(erc20Addr, _provider){
    const wbnbErc20 = new ethers.Contract(
        coin.WBNB,
        [{ "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "payable": false, "type": "function" }],
        _provider
    )

    const pair = getCakePair(coin.WBNB, erc20Addr)
    if (pair !== null && pair !== undefined) {
        if (pair.toString().indexOf('0x0000000000000') > -1) {
            log.debug(`交易对：${pair} 没找到， exit..`)
            throw new Error('LP not found.')
        }
    }
    log.debug(`UGD`, `pair:`,pair)

    // const erc20Contract = new ethers.Contract(erc20Addr, irc20Abi, _provider)

    let router = getRouter(provider)
    const tx = await router.callStatic.swapTokensForExactETH(
        utils.parseEther(`100000000`),
        utils.parseEther(`19935071`),
        [coin.UGD, coin.WBNB],
        // '0xfd0af3427444d557bf8a9bec1174e07497d0e1ba',
        '0x84a85B5114368DaB72f5525048E4aF1a8fC7804d',
        Date.now() + 1000 * 60 * 5,
        // {from: '0xfd0af3427444d557bf8a9bec1174e07497d0e1ba'}
        {from: '0x84a85B5114368DaB72f5525048E4aF1a8fC7804d'}
    )

    log.debug("交易结果：", tx)

}

const main = async ()=>{
    await swapAnlalyze(coin.UGD, provider)
}
main()
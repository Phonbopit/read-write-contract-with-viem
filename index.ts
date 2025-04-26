import {
  parseAbi,
  createPublicClient,
  http,
  formatUnits,
  parseUnits,
  createWalletClient,
} from 'viem'
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

import 'dotenv/config'

const privateKey = process.env.PRIVATE_KEY
const account = privateKeyToAccount(privateKey as `0x${string}`)
console.log(`Using account: ${account.address}`)

// contract address ของ USDC บน Sepolia
// https://sepolia.etherscan.io/token/0x1c7d4b196cb0c7b01d743fbc6116a902379c7238
const contractAddress = '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238'

const erc20Abi = parseAbi([
  // Read function
  'function balanceOf(address owner) view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  // Write function
  'function transfer(address to, uint256 amount) returns (bool)',
])

// 1. สร้าง publicClient
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
})

const read = async () => {
  // 2. เรียก readContract โดยระบุ functionName ให้ถูกตาม ABI
  const symbol = await publicClient.readContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: 'symbol',
  })

  console.log(`Token Symbol: ${symbol}`)

  const balance = await publicClient.readContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [account.address],
  })

  const decimals = await publicClient.readContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: 'decimals',
  })

  console.log(`decimals : ${decimals}`)

  // แปลง format จาก bigint ของ balance ให้เป็น string
  const balanceFormatted = formatUnits(balance, decimals)
  console.log(`Balance of ${account.address}: ${balanceFormatted} ${symbol}`)
}

const write = async () => {
  const recipientAddress = '0x...<YOUR_RECIPIENT_ADDRESS>'
  const amount = parseUnits('0.15', 6) // send 0.15 USDC

  // ตัวอย่าง ลอง simulate transfer ว่าติดปัญหาอะไรมั้ย
  const { request } = await publicClient.simulateContract({
    account,
    address: contractAddress,
    abi: erc20Abi,
    functionName: 'transfer',
    args: [recipientAddress, amount],
  })

  console.log('simulation success.')

  // uncomment ถ้า simulate ผ่าน
  // // 2. สร้าง instance walletClient จาก account private key
  // const walletClient = createWalletClient({
  //   account,
  //   chain: sepolia,
  //   transport: http(),
  // })

  // // 3. เอา request จาก ตอน simulate() มา
  // const txHash = await walletClient.writeContract(request)

  // // 4. รอ transaction confirmed
  // const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })

  // if (receipt.status === 'success') {
  //   console.log('Transfer successful! txHash: ', txHash)
  // } else {
  //   console.error('Transfer failed!', receipt)
  // }
}

read().catch(console.error)
// write().catch(console.error)

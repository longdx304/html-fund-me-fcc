import { ethers } from './ethers-5.2.esm.min.js';
import { abi, contractAddress } from './constants.js';

const connectButton = document.getElementById('connectButton');
const getBalanceButton = document.getElementById('getBalance');
const withdrawButton = document.getElementById('withdrawButton');
const fundButton = document.getElementById('fundButton');
connectButton.onclick = connect;
getBalanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;
fundButton.onclick = fund;

async function connect() {
  if (typeof window.ethereum != 'undefined') {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    } catch (error) {
      console.log(error);
    }
    document.getElementById('connectButton').innerHTML = 'Connected!';
  } else {
    document.getElementById('connectButton').innerHTML =
      'Please install metamask';
  }
}

async function getBalance() {
  if (typeof window.ethereum != 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
  }
}

async function fund() {
  const ethAmount = document.getElementById('ethAmount').value;
  console.log(`Funding with ${ethAmount}...`);
  if (typeof window.ethereum != 'undefined') {
    // provider / connection to the blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // signer / wallet / someone with some gas
    const signer = provider.getSigner();
    // contract that we are interaction with (ABI & Address)
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      // listen for tx to be mined
      await listenForTransactionMine(transactionResponse, provider);
      console.log('Done!');
    } catch (error) {
      console.log(error);
    }
  }
}

async function withdraw() {
  console.log('Withdrawing...');
  if (typeof window.ethereum != 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}

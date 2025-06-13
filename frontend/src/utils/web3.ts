import { ethers } from 'ethers';
import BondingCurveABI from '../abis/BondingCurve.json';
import TokenABI from '../abis/Token.json';

export interface TokenData {
  address: string;
  name: string;
  symbol: string;
  supply: string;
  bondingCurve: string;
  creator: string;
}

export interface BondingCurveData {
  virtualEth: string;
  realEth: string;
  tokenSupply: string;
  preBondingTarget: string;
  bondingTarget: string;
  isActive: boolean;
}

const ABSTRACT_TESTNET_CONFIG = {
  chainId: '0x2B74', // 11124 in hex
  chainName: 'Abstract L2 Testnet',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://api.testnet.abs.xyz'],
  blockExplorerUrls: ['https://explorer.testnet.abs.xyz'],
};

export const CONTRACT_ADDRESSES = {
  FACTORY: '0xA82ef1545854E36EAebAcF84e17089FeCb8944BC',
  BONDING_CURVE: '0x25dE7b35F051942Cc98FA750C3679ec15a2E2932',
  TOKEN_IMPLEMENTATION: '0xE46c4C13Ff1aF3265A5c4B678606F8228a8a627C',
};

export const FACTORY_ABI = [
  "function deployBondingCurveSystem(string memory name, string memory symbol, string memory description, string memory image, string memory twitter, string memory telegram, string memory website) external payable returns (address bondingCurve, address token)",
  "function getBondingCurveSettings() external view returns (uint256 virtualEth, uint256 preBondingTarget, uint256 bondingTarget, uint256 minContribution, uint24 poolFee)",
  "function getDeploymentFee() external view returns (uint256)",
  "event BondingCurveSystemDeployed(address indexed bondingCurveAddress, address indexed tokenAddress, address indexed owner, string name, string symbol)"
];

export const BONDING_CURVE_ABI = [
  "function buy() external payable returns (uint256 tokensReceived)",
  "function sell(uint256 tokenAmount) external returns (uint256 ethReceived)",
  "function getTokenPrice() external view returns (uint256)",
  "function getBuyPrice(uint256 ethAmount) external view returns (uint256 tokenAmount)",
  "function getSellPrice(uint256 tokenAmount) external view returns (uint256 ethAmount)",
  "function virtualEth() external view returns (uint256)",
  "function realEth() external view returns (uint256)",
  "function tokenSupply() external view returns (uint256)",
  "function preBondingTarget() external view returns (uint256)",
  "function bondingTarget() external view returns (uint256)",
  "function isActive() external view returns (bool)",
  "function token() external view returns (address)",
  "event TokensPurchased(address indexed buyer, uint256 ethAmount, uint256 tokenAmount, uint256 newPrice)",
  "event TokensSold(address indexed seller, uint256 tokenAmount, uint256 ethAmount, uint256 newPrice)"
];

export const TOKEN_ABI = [
  "function name() external view returns (string memory)",
  "function symbol() external view returns (string memory)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  async init() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();

    // Add Abstract Testnet to MetaMask if not already added
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ABSTRACT_TESTNET_CONFIG.chainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [ABSTRACT_TESTNET_CONFIG],
          });
        } catch (addError) {
          throw new Error('Failed to add Abstract Testnet to MetaMask');
        }
      } else {
        throw new Error('Failed to switch to Abstract Testnet');
      }
    }
  }

  async connectWallet(): Promise<string> {
    if (!this.provider) {
      await this.init();
    }
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  }

  async getBalance(address?: string): Promise<string> {
    if (!this.provider) {
      await this.init();
    }
    const balance = await this.provider!.getBalance(address || (await this.signer!.getAddress()));
    return ethers.formatEther(balance);
  }

  private getBondingCurveContract(address: string) {
    if (!this.signer) throw new Error('Web3 not initialized');
    return new ethers.Contract(address, BondingCurveABI, this.signer);
  }

  private getTokenContract(address: string) {
    if (!this.signer) throw new Error('Web3 not initialized');
    return new ethers.Contract(address, TokenABI, this.signer);
  }

  async getBuyPrice(bondingCurveAddress: string, ethAmount: string): Promise<string> {
    const contract = this.getBondingCurveContract(bondingCurveAddress);
    const tokens = await contract.calculateTokensForETH(ethers.parseEther(ethAmount));
    return ethers.formatEther(tokens);
  }

  async getSellPrice(bondingCurveAddress: string, tokenAmount: string): Promise<string> {
    const contract = this.getBondingCurveContract(bondingCurveAddress);
    const eth = await contract.calculateETHForTokens(ethers.parseEther(tokenAmount));
    return ethers.formatEther(eth);
  }

  async getBondingCurveData(bondingCurveAddress: string) {
    const contract = this.getBondingCurveContract(bondingCurveAddress);
    const [virtualEth, realEth, tokenSupply, preBondingTarget, bondingTarget, isActive] = await Promise.all([
      contract.virtualEth(),
      contract.realEth(),
      contract.tokenSupply(),
      contract.preBondingTarget(),
      contract.bondingTarget(),
      contract.isActive(),
    ]);

    return {
      virtualEth: ethers.formatEther(virtualEth),
      realEth: ethers.formatEther(realEth),
      tokenSupply: ethers.formatEther(tokenSupply),
      preBondingTarget: ethers.formatEther(preBondingTarget),
      bondingTarget: ethers.formatEther(bondingTarget),
      isActive,
    };
  }

  async getTokenData(tokenAddress: string) {
    const contract = this.getTokenContract(tokenAddress);
    const [name, symbol, totalSupply, bondingCurve] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.totalSupply(),
      contract.bondingCurve(),
    ]);

    const bondingCurveData = await this.getBondingCurveData(bondingCurve);
    const price = await this.getTokenPrice(bondingCurve);

    return {
      name,
      symbol,
      totalSupply: ethers.formatEther(totalSupply),
      bondingCurve,
      price,
      ...bondingCurveData,
    };
  }

  async getTokenPrice(bondingCurveAddress: string): Promise<string> {
    const contract = this.getBondingCurveContract(bondingCurveAddress);
    const price = await contract.getTokenPrice();
    return ethers.formatEther(price);
  }

  async getDeploymentFee(): Promise<string> {
    if (!this.signer) {
      await this.init();
    }

    const factory = new ethers.Contract(
      CONTRACT_ADDRESSES.FACTORY,
      FACTORY_ABI,
      this.signer
    );

    const fee = await factory.getDeploymentFee();
    return ethers.formatEther(fee);
  }

  async deployToken(
    name: string,
    symbol: string,
    description: string,
    imageUrl: string,
    socialLinks: {
      twitter?: string;
      telegram?: string;
      website?: string;
    }
  ) {
    try {
      if (!this.signer) {
        await this.init();
      }

      const factory = new ethers.Contract(
        CONTRACT_ADDRESSES.FACTORY,
        FACTORY_ABI,
        this.signer
      );

      const deploymentFee = await this.getDeploymentFee();
      console.log('Deployment fee:', deploymentFee);

      console.log('Deploying token with params:', {
        name,
        symbol,
        description,
        imageUrl,
        socialLinks,
        deploymentFee
      });

      const tx = await factory.deployBondingCurveSystem(
        name,
        symbol,
        description,
        imageUrl,
        socialLinks.twitter || '',
        socialLinks.telegram || '',
        socialLinks.website || '',
        { value: ethers.parseEther(deploymentFee) }
      );

      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);

      const event = receipt.logs.find(
        (log: any) => log.fragment?.name === 'BondingCurveSystemDeployed'
      );

      if (!event) {
        console.error('Deployment event not found in logs:', receipt.logs);
        throw new Error('Deployment event not found');
      }

      console.log('Deployment successful:', {
        bondingCurveAddress: event.args[0],
        tokenAddress: event.args[1]
      });

      return {
        bondingCurveAddress: event.args[0],
        tokenAddress: event.args[1],
      };
    } catch (error: any) {
      console.error('Error in deployToken:', error);
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient funds to deploy token');
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        throw new Error('Transaction would fail. Please check your input parameters.');
      } else {
        throw new Error(`Failed to deploy token: ${error.message}`);
      }
    }
  }
}

export const web3Service = new Web3Service();

// TypeScript declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
} 
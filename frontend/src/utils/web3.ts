import { ethers } from 'ethers';

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

export const ABSTRACT_TESTNET_CONFIG = {
  chainId: '0x2B6C', // 11124 in hex
  chainName: 'Abstract Testnet',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://api.testnet.abs.xyz'],
  blockExplorerUrls: ['https://sepolia.abscan.org'],
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

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      // Check if we're on the correct network
      const network = await this.provider.getNetwork();
      if (network.chainId !== BigInt(11124)) {
        await this.switchToAbstractTestnet();
      }
      
      const address = await this.signer.getAddress();
      return address;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  async switchToAbstractTestnet(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ABSTRACT_TESTNET_CONFIG.chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
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

  async getFactoryContract(): Promise<ethers.Contract> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    
    return new ethers.Contract(CONTRACT_ADDRESSES.FACTORY, FACTORY_ABI, this.signer);
  }

  async getBondingCurveContract(address: string): Promise<ethers.Contract> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    
    return new ethers.Contract(address, BONDING_CURVE_ABI, this.signer);
  }

  async getTokenContract(address: string): Promise<ethers.Contract> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    
    return new ethers.Contract(address, TOKEN_ABI, this.signer);
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  async getDeploymentFee(): Promise<string> {
    const factory = await this.getFactoryContract();
    const fee = await factory.getDeploymentFee();
    return ethers.formatEther(fee);
  }

  async deployToken(
    name: string,
    symbol: string,
    description: string,
    image: string,
    twitter: string,
    telegram: string,
    website: string
  ): Promise<{ tokenAddress: string; bondingCurveAddress: string; txHash: string }> {
    const factory = await this.getFactoryContract();
    const fee = await factory.getDeploymentFee();
    
    const tx = await factory.deployBondingCurveSystem(
      name,
      symbol,
      description,
      image,
      twitter,
      telegram,
      website,
      { value: fee }
    );
    
    const receipt = await tx.wait();
    
    // Parse the deployment event
    const deployedEvent = receipt.logs.find((log: any) => 
      log.topics[0] === ethers.id('BondingCurveSystemDeployed(address,address,address,string,string)')
    );
    
    if (!deployedEvent) {
      throw new Error('Deployment event not found');
    }
    
    const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
      ['address', 'address', 'address', 'string', 'string'],
      deployedEvent.data
    );
    
    return {
      bondingCurveAddress: decoded[0],
      tokenAddress: decoded[1],
      txHash: tx.hash
    };
  }

  async buyTokens(bondingCurveAddress: string, ethAmount: string): Promise<string> {
    const bondingCurve = await this.getBondingCurveContract(bondingCurveAddress);
    const tx = await bondingCurve.buy({ value: ethers.parseEther(ethAmount) });
    await tx.wait();
    return tx.hash;
  }

  async sellTokens(bondingCurveAddress: string, tokenAmount: string): Promise<string> {
    const bondingCurve = await this.getBondingCurveContract(bondingCurveAddress);
    const tx = await bondingCurve.sell(ethers.parseEther(tokenAmount));
    await tx.wait();
    return tx.hash;
  }

  async getBondingCurveData(bondingCurveAddress: string): Promise<BondingCurveData> {
    const bondingCurve = await this.getBondingCurveContract(bondingCurveAddress);
    
    const [virtualEth, realEth, tokenSupply, preBondingTarget, bondingTarget, isActive] = 
      await Promise.all([
        bondingCurve.virtualEth(),
        bondingCurve.realEth(),
        bondingCurve.tokenSupply(),
        bondingCurve.preBondingTarget(),
        bondingCurve.bondingTarget(),
        bondingCurve.isActive()
      ]);
    
    return {
      virtualEth: ethers.formatEther(virtualEth),
      realEth: ethers.formatEther(realEth),
      tokenSupply: ethers.formatEther(tokenSupply),
      preBondingTarget: ethers.formatEther(preBondingTarget),
      bondingTarget: ethers.formatEther(bondingTarget),
      isActive
    };
  }

  async getTokenData(tokenAddress: string): Promise<TokenData> {
    const token = await this.getTokenContract(tokenAddress);
    
    const [name, symbol, supply] = await Promise.all([
      token.name(),
      token.symbol(),
      token.totalSupply()
    ]);
    
    return {
      address: tokenAddress,
      name,
      symbol,
      supply: ethers.formatEther(supply),
      bondingCurve: '', // Will be filled by caller
      creator: '' // Will be filled by caller
    };
  }

  async getBuyPrice(bondingCurveAddress: string, ethAmount: string): Promise<string> {
    const bondingCurve = await this.getBondingCurveContract(bondingCurveAddress);
    const tokenAmount = await bondingCurve.getBuyPrice(ethers.parseEther(ethAmount));
    return ethers.formatEther(tokenAmount);
  }

  async getSellPrice(bondingCurveAddress: string, tokenAmount: string): Promise<string> {
    const bondingCurve = await this.getBondingCurveContract(bondingCurveAddress);
    const ethAmount = await bondingCurve.getSellPrice(ethers.parseEther(tokenAmount));
    return ethers.formatEther(ethAmount);
  }
}

// Global Web3 service instance
export const web3Service = new Web3Service();

// TypeScript declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
} 
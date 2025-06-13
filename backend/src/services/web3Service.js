const { ethers } = require('ethers');
const logger = require('../utils/logger');

// Contract ABIs (simplified for essential functions)
const FACTORY_ABI = [
  "function deployBondingCurveSystem(string name, string symbol) external payable returns (address tokenAddress, address bondingCurveAddress)",
  "function getDeploymentFee() external view returns (uint256)",
  "function updateDeploymentFee(uint256 newFee) external",
  "function withdrawFees(address recipient) external",
  "function getBondingCurveSettings() external view returns (tuple(uint256 virtualEth, uint256 preBondingTarget, uint256 bondingTarget, uint256 minContribution, uint24 poolFee, uint24 sellFee, address uniswapV3Factory, address positionManager, address weth, address feeTo))",
  "function updateBondingCurveSettings(tuple(uint256 virtualEth, uint256 preBondingTarget, uint256 bondingTarget, uint256 minContribution, uint24 poolFee, uint24 sellFee, address uniswapV3Factory, address positionManager, address weth, address feeTo) newSettings) external",
  "event BondingCurveSystemDeployed(address indexed bondingCurveAddress, address indexed tokenAddress, address indexed owner, string name, string symbol)",
  "event DeploymentFeeUpdated(uint256 oldFee, uint256 newFee)",
  "event BondingCurveSettingsUpdated(uint256 virtualEth, uint256 preBondingTarget, uint256 bondingTarget, uint256 minContribution, uint24 poolFee)"
];

const BONDING_CURVE_ABI = [
  "function contributePreBonding() external payable",
  "function buyTokens(uint256 minTokens) external payable returns (uint256 tokensToReceive)",
  "function sellTokens(uint256 tokenAmount, uint256 minETH) external returns (uint256 ethToReceive, uint256 fee)",
  "function finalizeCurve() external",
  "function token() external view returns (address)",
  "function currentPhase() external view returns (uint8)",
  "function totalPreBondingContributions() external view returns (uint256)",
  "function ethReserve() external view returns (uint256)",
  "function tokenReserve() external view returns (uint256)",
  "function totalETHCollected() external view returns (uint256)",
  "function contributions(address user) external view returns (uint256)",
  "function tokenAllocations(address user) external view returns (uint256)",
  "function isFinalized() external view returns (bool)",
  "function getBondingCurveSettings() external view returns (tuple(uint256 virtualEth, uint256 preBondingTarget, uint256 bondingTarget, uint256 minContribution, uint24 poolFee, uint24 sellFee, address uniswapV3Factory, address positionManager, address weth, address feeTo))",
  "event PreBondingContribution(address indexed user, uint256 ethAmount, uint256 tokensOut)",
  "event TokensPurchased(address indexed user, uint256 ethAmount, uint256 tokensOut)",
  "event TokensSold(address indexed user, uint256 tokensIn, uint256 ethOut, uint256 fee)",
  "event CurveFinalized(address indexed pool, uint256 lpTokenId)"
];

const TOKEN_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

class Web3Service {
  constructor() {
    this.provider = null;
    this.factoryContract = null;
    this.bondingCurveContract = null;
    this.isInitialized = false;
  }

  // Helper function to create wallet from either private key or mnemonic
  createWallet(keyOrMnemonic) {
    try {
      // Remove '0x' prefix if present and clean the input
      const cleanInput = keyOrMnemonic.trim().replace(/^0x/, '');
      
      // Check if it's a private key (64 hex characters)
      if (/^[a-fA-F0-9]{64}$/.test(cleanInput)) {
        return new ethers.Wallet('0x' + cleanInput, this.provider);
      }
      
      // If not a private key, treat as mnemonic
      const words = cleanInput.split(' ').filter(word => word.length > 0);
      if (words.length >= 12) {
        // It's a mnemonic phrase
        const wallet = ethers.Wallet.fromPhrase(cleanInput, this.provider);
        logger.info(`Created wallet from mnemonic. Address: ${wallet.address}`);
        return wallet;
      }
      
      throw new Error('Invalid private key or mnemonic phrase format');
    } catch (error) {
      logger.error('Error creating wallet:', error.message);
      throw new Error(`Invalid private key or mnemonic: ${error.message}`);
    }
  }

  async initializeWeb3() {
    try {
      // Initialize provider (using testnet since contracts are deployed there)
      const rpcUrl = process.env.ABSTRACT_TESTNET_RPC_URL || 'https://api.testnet.abs.xyz';
      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      // Test the connection
      const network = await this.provider.getNetwork();
      logger.info(`Connected to Abstract L2 - Chain ID: ${network.chainId}`);

      // Initialize factory contract
      const factoryAddress = process.env.FACTORY_ADDRESS;
      if (!factoryAddress) {
        throw new Error('Factory address not provided in environment variables');
      }

      this.factoryContract = new ethers.Contract(factoryAddress, FACTORY_ABI, this.provider);

      logger.info(`Factory contract initialized at: ${factoryAddress}`);
      this.isInitialized = true;

      return true;
    } catch (error) {
      logger.error('Failed to initialize Web3 service:', error);
      throw error;
    }
  }

  // Admin functions
  async getDeploymentFee() {
    try {
      const fee = await this.factoryContract.getDeploymentFee();
      return ethers.formatEther(fee);
    } catch (error) {
      logger.error('Error getting deployment fee:', error);
      throw error;
    }
  }

  async updateDeploymentFee(newFeeInEth, adminPrivateKey) {
    try {
      const wallet = this.createWallet(adminPrivateKey);
      const factoryWithSigner = this.factoryContract.connect(wallet);
      
      const feeInWei = ethers.parseEther(newFeeInEth.toString());
      const tx = await factoryWithSigner.updateDeploymentFee(feeInWei);
      
      logger.info(`Deployment fee update transaction: ${tx.hash}`);
      const receipt = await tx.wait();
      
      return {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        success: true
      };
    } catch (error) {
      logger.error('Error updating deployment fee:', error);
      throw error;
    }
  }

  async getBondingCurveSettings() {
    try {
      const settings = await this.factoryContract.getBondingCurveSettings();
      return {
        virtualEth: ethers.formatEther(settings.virtualEth),
        preBondingTarget: ethers.formatEther(settings.preBondingTarget),
        bondingTarget: ethers.formatEther(settings.bondingTarget),
        minContribution: ethers.formatEther(settings.minContribution),
        poolFee: settings.poolFee.toString(),
        sellFee: settings.sellFee.toString(),
        uniswapV3Factory: settings.uniswapV3Factory,
        positionManager: settings.positionManager,
        weth: settings.weth,
        feeTo: settings.feeTo
      };
    } catch (error) {
      logger.error('Error getting bonding curve settings:', error);
      throw error;
    }
  }

  async updateBondingCurveSettings(newSettings, adminPrivateKey) {
    try {
      const wallet = this.createWallet(adminPrivateKey);
      const factoryWithSigner = this.factoryContract.connect(wallet);

      // Convert settings to proper format
      const settingsStruct = {
        virtualEth: ethers.parseEther(newSettings.virtualEth.toString()),
        preBondingTarget: ethers.parseEther(newSettings.preBondingTarget.toString()),
        bondingTarget: ethers.parseEther(newSettings.bondingTarget.toString()),
        minContribution: ethers.parseEther(newSettings.minContribution.toString()),
        poolFee: newSettings.poolFee,
        sellFee: newSettings.sellFee,
        uniswapV3Factory: newSettings.uniswapV3Factory,
        positionManager: newSettings.positionManager,
        weth: newSettings.weth,
        feeTo: newSettings.feeTo
      };

      const tx = await factoryWithSigner.updateBondingCurveSettings(settingsStruct);
      
      logger.info(`Bonding curve settings update transaction: ${tx.hash}`);
      const receipt = await tx.wait();
      
      return {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        success: true
      };
    } catch (error) {
      logger.error('Error updating bonding curve settings:', error);
      throw error;
    }
  }

  async withdrawFees(recipient, adminPrivateKey) {
    try {
      const wallet = this.createWallet(adminPrivateKey);
      const factoryWithSigner = this.factoryContract.connect(wallet);
      
      const tx = await factoryWithSigner.withdrawFees(recipient);
      
      logger.info(`Fee withdrawal transaction: ${tx.hash}`);
      const receipt = await tx.wait();
      
      return {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        success: true
      };
    } catch (error) {
      logger.error('Error withdrawing fees:', error);
      throw error;
    }
  }

  // User functions
  async deployToken(name, symbol, userPrivateKey) {
    try {
      const wallet = this.createWallet(userPrivateKey);
      const factoryWithSigner = this.factoryContract.connect(wallet);
      
      // Automatically fetch the current deployment fee from the contract
      const currentFee = await this.factoryContract.getDeploymentFee();
      logger.info(`Auto-fetched deployment fee: ${ethers.formatEther(currentFee)} ETH`);
      
      const tx = await factoryWithSigner.deployBondingCurveSystem(name, symbol, {
        value: currentFee
      });
      
      logger.info(`Token deployment transaction: ${tx.hash}`);
      const receipt = await tx.wait();
      
      // Parse events to get deployed addresses
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.factoryContract.interface.parseLog(log);
          return parsed.name === 'BondingCurveSystemDeployed';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = this.factoryContract.interface.parseLog(event);
        return {
          transactionHash: tx.hash,
          blockNumber: receipt.blockNumber,
          tokenAddress: parsed.args.tokenAddress,
          bondingCurveAddress: parsed.args.bondingCurveAddress,
          owner: parsed.args.owner,
          name: parsed.args.name,
          symbol: parsed.args.symbol,
          success: true
        };
      }

      throw new Error('Deployment event not found in transaction receipt');
    } catch (error) {
      logger.error('Error deploying token:', error);
      throw error;
    }
  }

  // Bonding curve functions
  getBondingCurveContract(bondingCurveAddress) {
    return new ethers.Contract(bondingCurveAddress, BONDING_CURVE_ABI, this.provider);
  }

  getTokenContract(tokenAddress) {
    return new ethers.Contract(tokenAddress, TOKEN_ABI, this.provider);
  }

  async getBondingCurveInfo(bondingCurveAddress) {
    try {
      const contract = this.getBondingCurveContract(bondingCurveAddress);
      
      const [
        tokenAddress,
        currentPhase,
        totalPreBondingContributions,
        ethReserve,
        tokenReserve,
        totalETHCollected,
        isFinalized,
        settings
      ] = await Promise.all([
        contract.token(),
        contract.currentPhase(),
        contract.totalPreBondingContributions(),
        contract.ethReserve(),
        contract.tokenReserve(),
        contract.totalETHCollected(),
        contract.isFinalized(),
        contract.getBondingCurveSettings()
      ]);

      return {
        tokenAddress,
        currentPhase: parseInt(currentPhase.toString()),
        totalPreBondingContributions: ethers.formatEther(totalPreBondingContributions),
        ethReserve: ethers.formatEther(ethReserve),
        tokenReserve: ethers.formatUnits(tokenReserve, 18),
        totalETHCollected: ethers.formatEther(totalETHCollected),
        isFinalized,
        settings: {
          virtualEth: ethers.formatEther(settings.virtualEth),
          preBondingTarget: ethers.formatEther(settings.preBondingTarget),
          bondingTarget: ethers.formatEther(settings.bondingTarget),
          minContribution: ethers.formatEther(settings.minContribution),
          poolFee: settings.poolFee.toString(),
          sellFee: settings.sellFee.toString()
        }
      };
    } catch (error) {
      logger.error('Error getting bonding curve info:', error);
      throw error;
    }
  }

  async getTokenInfo(tokenAddress) {
    try {
      const contract = this.getTokenContract(tokenAddress);
      
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply()
      ]);

      return {
        name,
        symbol,
        decimals: parseInt(decimals.toString()),
        totalSupply: ethers.formatUnits(totalSupply, decimals)
      };
    } catch (error) {
      logger.error('Error getting token info:', error);
      throw error;
    }
  }

  async getUserContribution(bondingCurveAddress, userAddress) {
    try {
      const contract = this.getBondingCurveContract(bondingCurveAddress);
      
      const [contribution, tokenAllocation] = await Promise.all([
        contract.contributions(userAddress),
        contract.tokenAllocations(userAddress)
      ]);

      return {
        contribution: ethers.formatEther(contribution),
        tokenAllocation: ethers.formatUnits(tokenAllocation, 18)
      };
    } catch (error) {
      logger.error('Error getting user contribution:', error);
      throw error;
    }
  }

  // Transaction monitoring
  async getTransactionReceipt(txHash) {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      return receipt;
    } catch (error) {
      logger.error('Error getting transaction receipt:', error);
      throw error;
    }
  }

  async getBlockNumber() {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      logger.error('Error getting block number:', error);
      throw error;
    }
  }

  // Utility functions
  isValidAddress(address) {
    return ethers.isAddress(address);
  }

  formatEther(value) {
    return ethers.formatEther(value);
  }

  parseEther(value) {
    return ethers.parseEther(value.toString());
  }
}

// Create singleton instance
const web3Service = new Web3Service();

const initializeWeb3 = async () => {
  await web3Service.initializeWeb3();
};

module.exports = {
  web3Service,
  initializeWeb3
}; 
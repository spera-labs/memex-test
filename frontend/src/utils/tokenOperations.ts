import { ethers } from 'ethers';
import { web3Service } from './web3';
import toast from 'react-hot-toast';

export interface TokenOperationResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export async function buyTokens(
  bondingCurveAddress: string,
  ethAmount: string,
  minTokens: string
): Promise<TokenOperationResult> {
  try {
    const bondingCurve = await web3Service.getBondingCurveContract(bondingCurveAddress);
    
    // Calculate expected tokens
    const expectedTokens = await web3Service.getBuyPrice(bondingCurveAddress, ethAmount);
    
    // Add 1% slippage tolerance
    const minTokensWithSlippage = ethers.formatEther(
      (ethers.parseEther(expectedTokens) * BigInt(99)) / BigInt(100)
    );

    // Execute buy transaction
    const tx = await bondingCurve.buyTokens(
      ethers.parseEther(minTokensWithSlippage),
      { value: ethers.parseEther(ethAmount) }
    );

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    return {
      success: true,
      txHash: receipt.hash
    };
  } catch (error: any) {
    console.error('Error buying tokens:', error);
    return {
      success: false,
      error: error.message || 'Failed to buy tokens'
    };
  }
}

export async function sellTokens(
  bondingCurveAddress: string,
  tokenAmount: string,
  minEth: string
): Promise<TokenOperationResult> {
  try {
    const bondingCurve = await web3Service.getBondingCurveContract(bondingCurveAddress);
    
    // Calculate expected ETH
    const expectedEth = await web3Service.getSellPrice(bondingCurveAddress, tokenAmount);
    
    // Add 1% slippage tolerance
    const minEthWithSlippage = ethers.formatEther(
      (ethers.parseEther(expectedEth) * BigInt(99)) / BigInt(100)
    );

    // Get token contract
    const token = await web3Service.getTokenContract(bondingCurveAddress);
    
    // Approve bonding curve to spend tokens
    const approveTx = await token.approve(
      bondingCurveAddress,
      ethers.parseEther(tokenAmount)
    );
    await approveTx.wait();

    // Execute sell transaction
    const tx = await bondingCurve.sellTokens(
      ethers.parseEther(tokenAmount),
      ethers.parseEther(minEthWithSlippage)
    );

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    return {
      success: true,
      txHash: receipt.hash
    };
  } catch (error: any) {
    console.error('Error selling tokens:', error);
    return {
      success: false,
      error: error.message || 'Failed to sell tokens'
    };
  }
}

export async function getTokenPrice(bondingCurveAddress: string): Promise<string> {
  try {
    const bondingCurve = await web3Service.getBondingCurveContract(bondingCurveAddress);
    const price = await bondingCurve.getTokenPrice();
    return ethers.formatEther(price);
  } catch (error) {
    console.error('Error getting token price:', error);
    return '0';
  }
}

export async function getBondingCurveData(bondingCurveAddress: string) {
  try {
    return await web3Service.getBondingCurveData(bondingCurveAddress);
  } catch (error) {
    console.error('Error getting bonding curve data:', error);
    throw error;
  }
}

export async function getTokenData(tokenAddress: string) {
  try {
    return await web3Service.getTokenData(tokenAddress);
  } catch (error) {
    console.error('Error getting token data:', error);
    throw error;
  }
}

// Helper function to handle token operations with toast notifications
export async function handleTokenOperation(
  operation: () => Promise<TokenOperationResult>,
  loadingMessage: string,
  successMessage: string,
  errorMessage: string
): Promise<boolean> {
  const loadingToast = toast.loading(loadingMessage);
  
  try {
    const result = await operation();
    
    if (result.success) {
      toast.dismiss(loadingToast);
      toast.success(successMessage);
      return true;
    } else {
      toast.dismiss(loadingToast);
      toast.error(result.error || errorMessage);
      return false;
    }
  } catch (error: any) {
    toast.dismiss(loadingToast);
    toast.error(error.message || errorMessage);
    return false;
  }
} 
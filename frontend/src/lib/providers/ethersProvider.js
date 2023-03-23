import { ethers } from "ethers";
import escrowAbi from "/workspace/Albatross-1/backend/artifacts/contracts/Escrow.sol/Escrow.json";
import franchiseAbi from "/workspace/Albatross-1/backend/artifacts/contracts/Franchise.sol/Franchise.json";



class EthersProvider {
  constructor() {
    this.provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    this.signer = this.provider.getSigner();
  }

  getContract({ address, abi }) {
    return new ethers.Contract(address, abi, this.signer);
  }

  get escrowContract() {
    const contract = this.getContract({
      abi: escrowAbi.abi,
      address: escrowAbi.address
    });
    return {
      getFundingProgress: async (nftID) => {
        const currentDeposit = await contract.currentDeposit(nftID);
        const goalAmount = await contract.goalAmount(nftID);
        if (goalAmount.eq(0)) {
          return 0;
        }
        return currentDeposit.mul(100).div(goalAmount);
      },
      getEadd: async () => await contract.inspector(),
      buyerDepositEarnest: async (nftID, { amount }) => {
        const amountInWei = ethers.utils.parseUnits(amount.toString(), 'ether');
        const tx = await contract.connect(this.signer).depositEarnest(nftID, { value: amountInWei });
        const receipt = await tx.wait();
        return receipt;
      }
    };
  }

  get franchiseContract() {
    const contract = this.getContract({
      abi: franchiseAbi.abi,
      address: franchiseAbi.address
    });
    return {
      getTotalSupply: async () => await contract.totalSupply(),
      getTokenURI: async () => {
        const nfts = []
        const totalSupply = await contract.totalSupply()
        for (var i = 1; i <= totalSupply; i++) {
          const uri = await contract.tokenURI(i);
          const response = await fetch(uri)
          const metadapp = await response.json()
          nfts.push(metadapp)   
        }
        return nfts
      }
    }
  }
}

export default EthersProvider;

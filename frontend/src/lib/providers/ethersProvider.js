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
      getEadd: async () => await contract.inspector()
    }
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

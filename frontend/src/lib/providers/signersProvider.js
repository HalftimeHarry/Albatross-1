import { ethers } from "ethers"
import escrow from "/workspace/Albatross-1/backend/artifacts/contracts/Escrow.sol/Escrow.json"

class SignersProvider {
    constructor() {
        this.provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        this.signer = this.provider.getSigner();
    }

    getContract({ address, abi }) {
        return new ethers.Contract(address, abi, this.signer);
    }

    get escrowContract() {
        const contract = this.getContract({
            abi: escrow.abi,
            address: escrow.address
        });
        return {
            getOwner: async () => await contract.owner(),
            getInspector: async () => await contract.inspector(),
            getLender: async () => await contract.lender()
        }
    }
}

export default SignersProvider;

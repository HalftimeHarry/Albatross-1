// @ts-nocheck
import { ethers } from "ethers"
import escrowAbi from "/workspace/Albatross-1/backend/artifacts/contracts/Escrow.sol/Escrow.json"

class EthersProvider {
    constructor() {
        this.provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        this.signer = this.provider.getSigner();
    }

    getContract(address, abi) {
        return new ethers.Contract(address, abi, this.signer);
    }

    get escrowContract() {
        const contract = this.getContract(
            escrowAbi.address,
            escrowAbi.abi
        );

        return contract;
    }
}

export default EthersProvider;

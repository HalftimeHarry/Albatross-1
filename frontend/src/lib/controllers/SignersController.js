import SignersProvider from "/workspace/Albatross-1/frontend/src/lib/providers/signersProvider.js";
import { writable } from "svelte/store";

const baseState = {
    seller: "loading seller...",
    lender: "loading lender...",
    inspector: "loading inspector..."
}


class SignersController { 
    #signersStore=writable({...baseState})
  
    constructor() {
        this.signers_store = {
            subscribe: this.#signersStore.subscribe
        }
    }
      
    async init() {
        this.signersProvider = new SignersProvider();
        this.#getSigners();
    }
  
    async #getSigners() {
        const seller = await this.signersProvider?.escrowContract.getSeller();
        const lender = await this.signersProvider?.escrowContract.getLender();
        const inspector = await this.signersProvider?.escrowContract.getInspector();
        this.#signersStore.update(s => ({ ...s, seller, lender, inspector }))
    }

}

export default new SignersController();

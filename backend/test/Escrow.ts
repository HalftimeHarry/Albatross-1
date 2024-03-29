const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {
    let buyer, seller, inspector, lender, dao
    let franchise, escrow

    beforeEach(async () => {
        // Setup accounts
        [buyer, seller, inspector, lender, dao] = await ethers.getSigners()

        // Deploy Real Estate
        const Franchise = await ethers.getContractFactory('Franchise')
        franchise = await Franchise.deploy()

        // Mint 
        // try to create 12 NFT's
        let transaction = await franchise.connect(seller).mint("https://dulligans.mypinata.cloud/ipfs/QmZBa6eGpSN9STrNUg67fHtW7N9jq86eKvzxk6i7sTotD8")
        await transaction.wait()

        // Deploy Escrow
        const Escrow = await ethers.getContractFactory('Escrow')
        escrow = await Escrow.deploy(
            franchise.address,
            seller.address,
            inspector.address,
            lender.address,
            dao.address
        )

        // Approve Property
        transaction = await franchise.connect(seller).approve(escrow.address, 1)
        await transaction.wait()

        // List Property
        transaction = await escrow.connect(seller).list(1, buyer.address, tokens(10), tokens(5))
        await transaction.wait()
    })

    describe('Deployment', () => {
        it('Returns NFT address', async () => {
            const result = await escrow.nftAddress()
            expect(result).to.be.equal(franchise.address)
        })

        it('Returns seller', async () => {
            const result = await escrow.seller()
            expect(result).to.be.equal(seller.address)
        })

        it('Returns inspector', async () => {
            const result = await escrow.inspector()
            expect(result).to.be.equal(inspector.address)
        })

        it('Returns lender', async () => {
            const result = await escrow.lender()
            expect(result).to.be.equal(lender.address)
        })

        it('Returns dao', async () => {
            const result = await escrow.dao()
            expect(result).to.be.equal(dao.address)
        })
    })

    describe('Listing', () => {
        it('Updates as listed', async () => {
            const result = await escrow.isListed(1)
            expect(result).to.be.equal(true)
        })

        it('Returns buyer', async () => {
            const result = await escrow.buyer(1)
            expect(result).to.be.equal(buyer.address)
        })

        it('Returns purchase price', async () => {
            const result = await escrow.purchasePrice(1)
            expect(result).to.be.equal(tokens(10))
        })

        it('Returns escrow amount', async () => {
            const result = await escrow.escrowAmount(1)
            expect(result).to.be.equal(tokens(5))
        })

        it('Updates ownership', async () => {
            expect(await franchise.ownerOf(1)).to.be.equal(escrow.address)
        })
    })

    describe('Deposits', () => {
        beforeEach(async () => {
            const transaction = await escrow.connect(buyer).depositEarnest(1, { value: tokens(5) })
            await transaction.wait()
        })

        it('Updates contract balance', async () => {
            const result = await escrow.getBalance()
            expect(result).to.be.equal(tokens(5))
        })

        it('Reaches goal amount', async () => {
            const result = await escrow.getBalance()
            expect(result).to.be.equal(tokens(5))
        })
    })

        describe('Inspection', () => {
            beforeEach(async () => {
                const transaction = await escrow.connect(inspector).updateInspectionStatus(1, true)
                await transaction.wait()
            })

            it('Updates inspection status', async () => {
                const result = await escrow.inspectionPassed(1)
                expect(result).to.be.equal(true)
            })
        })

    describe('Approval', () => {
        beforeEach(async () => {
            let transaction = await escrow.connect(buyer).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(seller).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(lender).approveSale(1)
            await transaction.wait()
        })

        it('Updates approval status', async () => {
            expect(await escrow.approval(1, buyer.address)).to.be.equal(true)
            expect(await escrow.approval(1, seller.address)).to.be.equal(true)
            expect(await escrow.approval(1, lender.address)).to.be.equal(true)
        })
    })

    describe('Sale', () => {
        beforeEach(async () => {
            let transaction = await escrow.connect(buyer).depositEarnest(1, { value: tokens(5) })
            await transaction.wait()

            transaction = await escrow.connect(inspector).updateInspectionStatus(1, true)
            await transaction.wait()

            transaction = await escrow.connect(buyer).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(dao).approveSale(1)
            await transaction.wait()


            transaction = await escrow.connect(seller).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(lender).approveSale(1)
            await transaction.wait()

            await lender.sendTransaction({ to: escrow.address, value: tokens(5) })

            transaction = await escrow.connect(seller).finalizeSale(1)
            await transaction.wait()
        })

        it('Updates ownership to DAO', async () => {
            expect(await franchise.ownerOf(1)).to.be.equal(dao.address)
        })

        it('Updates balance', async () => {
            expect(await escrow.getBalance()).to.be.equal(0)
        })

        it('Returns additional funds after reaching goal amount', async () => {
        let transaction = await escrow.connect(buyer).depositEarnest(1, { value: tokens(5) });
        await transaction.wait();

        transaction = await escrow.connect(buyer).depositEarnest(1, { value: tokens(6) });
        await transaction.wait();

        const buyerBalance = await buyer.getBalance();
        const escrowBalance = await escrow.getBalance();

        expect(escrowBalance).to.be.equal(tokens(11));
        expect(buyerBalance).to.be.gt(tokens(6));
    })
    })
    describe('Roles', () => {
        it('Allows to set seller', async () => {
            const newseller = await ethers.getSigner()
            const transaction = await escrow.connect(seller).setSeller(newseller.address)
            await transaction.wait()

            const result = await escrow.seller()
            expect(result).to.be.equal(newseller.address)
        })

        it('Allows to set inspector', async () => {
            const newInspector = await ethers.getSigner();
            const transaction = await escrow.connect(seller).setInspector(newInspector.address);
            await transaction.wait();
        })

        it('Allows to set lender', async () => {
            const newLender = await ethers.getSigner()
            const transaction = await escrow.connect(seller).setLender(newLender.address)
            await transaction.wait()

            const result = await escrow.lender()
            expect(result).to.be.equal(newLender.address)
        })

        it('Only allows seller to set seller', async () => {
            const newseller = await ethers.getSigner()
            const transaction = escrow.connect(buyer).setSeller(newseller.address)
            await expect(transaction).to.be.revertedWith('Only seller can call this method')
        })

        it('Only allows seller to set inspector', async () => {
            const newInspector = await ethers.getSigner()
            const transaction = escrow.connect(buyer).setInspector(newInspector.address)
            await expect(transaction).to.be.revertedWith('Only seller can call this method')
        })

        it('Only allows seller to set lender', async () => {
            const newLender = await ethers.getSigner()
            const transaction = escrow.connect(buyer).setLender(newLender.address)
            await expect(transaction).to.be.revertedWith('Only seller can call this method')
        })
    })
})
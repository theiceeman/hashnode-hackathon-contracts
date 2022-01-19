//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../vault/Vault.sol";

contract UserWallet is ReentrancyGuard, Vault {
    /*
        send tokens that will be stored in their vault (recieve)
        withdraw tokens from vault (send)
        view total_vault balance
     */

    Vault private vault;

    constructor(address _vaultAddress) {
        vault = Vault(_vaultAddress);
    }

    /* 
        address_of_token, amount
    */
    function deposit(address tokenAddress, uint256 amount)
        public
        nonReentrant
        returns (bool success)
    {
        UserVaultTokenDetail memory userVault = vault._getUserVault(
            msg.sender,
            tokenAddress
        );
        IERC20 paymentToken = IERC20(tokenAddress);
        require(amount > 0, "Wallet: amount cannot be 0!");
        require(
            paymentToken.transferFrom(msg.sender, address(this), amount),
            "Wallet: Deposit failed!"
        );
        require(
            paymentToken.transfer(address(vault), amount),
            "Wallet: transfer to vault failed!"
        );
        uint256 userNewBalance = userVault.totalAmount + amount;
        vault._setUserVault(msg.sender, tokenAddress, userNewBalance);

        return true;
    }

    function withdrawFromVault(
        address recipient,
        address tokenAddress,
        uint256 amount
    ) public nonReentrant returns (bool success) {
        UserVaultTokenDetail memory userVault = vault._getUserVault(
            msg.sender,
            tokenAddress
        );
        require(userVault.isExists, "Wallet: Only account owner can withdraw!");
        require(
            amount > 0,
            "Wallet: withdrawal amount must be greater than zero!"
        );
        require(
            amount <= userVault.totalAmount,
            "Wallet: Insufficient token funds for user!"
        );
        IERC20 withdrawalToken = IERC20(tokenAddress);
        require(
            withdrawalToken.transferFrom(address(vault), recipient, amount),
            "Wallet: transfer to vault failed!"
        );
        uint256 userRemainingBalance = userVault.totalAmount - amount;
        vault._setUserVault(msg.sender, tokenAddress, userRemainingBalance);

        return true;
    }
}

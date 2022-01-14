//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../vault/UserVault.sol";

contract UserWallet is ReentrancyGuard {
    /*
        send tokens that will be stored in their vault (recieve)
        withdraw tokens from vault (send)
        view total_vault balance
     */

    address public vaultAddress;

    constructor(address _vaultAddress) {
        vaultAddress = _vaultAddress;
    }

    /* 
        address_of_token, amount
    */
    function recieve(address tokenAddress, uint256 amount)
        public
        nonReentrant
        returns (bool success)
    {
        IERC20 paymentToken = IERC20(tokenAddress);
        require(amount > 0, "wallet: amount cannot be 0!");
        require(paymentToken.transferFrom(msg.sender, address(this), amount));
        paymentToken.transfer(vaultAddress, amount);
        UserVault vault = UserVault(vaultAddress);
        vault.addNewTokenToUserVault(msg.sender, tokenAddress, amount);

        return true;
    }
}

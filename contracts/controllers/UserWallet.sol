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

    address internal userVaultAddress;

    constructor(address _userVaultAddress) {
        userVaultAddress = _userVaultAddress;
    }

    /* 
        address_of_token, amount
    */
    function recieve(address tokenAddress, uint256 amount)
        public
        nonReentrant
        returns (bool success)
    {
        require(amount > 0, "wallet: amount cannot be 0");
        require(
            IERC20(tokenAddress).transferFrom(
                msg.sender,
                userVaultAddress,
                amount
            )
        );
        UserVault vault = UserVault(userVaultAddress);
        vault.addNewTokenToUserVault(msg.sender, tokenAddress, amount);

        return true;
    }
}

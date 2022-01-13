//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract UserVault {
    
    // (user_address => token_address -> amount_locked)
    mapping(address => mapping(address => uint256)) private userVault;

    function addNewTokenToUserVault(
        address userAddress,
        address tokenAddress,
        uint256 amount
    ) public {
        userVault[userAddress][tokenAddress] = amount;
    }

    function getUserTokenBalance(address userAddress, address tokenAddress)
        internal
        view
        returns (uint256)
    {
        return userVault[userAddress][tokenAddress];
    }
}

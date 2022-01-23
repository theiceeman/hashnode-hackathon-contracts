//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface Erc20 {
    function approve(address, uint256) external returns (bool);

    function transfer(address, uint256) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external;
}

interface CErc20 {
    function balanceOfUnderlying(address account) external returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function mint(uint256) external returns (uint256);

    function exchangeRateCurrent() external returns (uint256);

    function supplyRatePerBlock() external returns (uint256);

    function redeem(uint256) external returns (uint256);

    function redeemUnderlying(uint256) external returns (uint256);
}

interface CEth {
    function balanceOfUnderlying(address account) external returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function mint() external payable;

    function exchangeRateCurrent() external returns (uint256);

    function supplyRatePerBlock() external returns (uint256);

    function redeem(uint256) external returns (uint256);

    function redeemUnderlying(uint256) external returns (uint256);
}

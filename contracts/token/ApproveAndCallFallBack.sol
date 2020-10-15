// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.6.0 <0.8.0;

abstract contract ApproveAndCallFallBack {
    function receiveApproval(address from, uint256 _amount, address _token, bytes memory _data) public virtual;
}

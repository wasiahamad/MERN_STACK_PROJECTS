// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CertificateRegistry {
    mapping(bytes32 => bool) public issued;

    event CertificateIssued(bytes32 indexed certHash, address indexed issuer);

    function issueCertificate(bytes32 certHash) external {
        require(certHash != bytes32(0), "INVALID_HASH");
        require(!issued[certHash], "ALREADY_ISSUED");

        issued[certHash] = true;
        emit CertificateIssued(certHash, msg.sender);
    }

    function verifyCertificate(bytes32 certHash) external view returns (bool) {
        return issued[certHash];
    }
}

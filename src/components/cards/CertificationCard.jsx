import React from "react";
import styled from "styled-components";

const Card = styled.div`
  width: 100%;
  max-width: 340px;
  background-color: rgba(17, 25, 40, 0.83);
  border: 1px solid rgba(255, 255, 255, 0.125);
  box-shadow: rgba(23, 92, 230, 0.15) 0px 4px 24px;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Logo = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: contain;
  background-color: ${({ theme }) => theme.white};
  padding: 4px;
`;

const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
`;

const Issuer = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.text_secondary};
`;

const Date = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.text_secondary + 99};
`;

const CredentialId = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.text_secondary + 99};
`;

const SkillList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const SkillTag = styled.div`
  font-size: 11px;
  font-weight: 400;
  color: ${({ theme }) => theme.primary};
  background-color: ${({ theme }) => theme.primary + 15};
  padding: 3px 8px;
  border-radius: 10px;
`;

const ShowCredential = styled.a`
  align-self: flex-start;
  margin-top: 4px;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.primary};
  border: 1px solid ${({ theme }) => theme.primary};
  border-radius: 20px;
  padding: 6px 14px;
  text-decoration: none;
`;

const CertificationCard = ({ certification }) => {
  return (
    <Card>
      <Top>
        <Logo src={certification.logo} alt={certification.issuer} />
        <HeaderText>
          <Title>{certification.title}</Title>
          <Issuer>{certification.issuer}</Issuer>
        </HeaderText>
      </Top>
      <Date>{certification.date}</Date>
      <CredentialId>Credential ID {certification.credentialId}</CredentialId>
      {certification.skills?.length > 0 && (
        <SkillList>
          {certification.skills.map((skill, index) => (
            <SkillTag key={index}>{skill}</SkillTag>
          ))}
        </SkillList>
      )}
      <ShowCredential
        href={certification.credentialUrl}
        target="_blank"
        rel="noreferrer"
      >
        Show credential
      </ShowCredential>
    </Card>
  );
};

export default CertificationCard;

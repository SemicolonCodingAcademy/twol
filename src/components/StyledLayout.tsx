'use client';

import styled from 'styled-components';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #6e8efb 0%, #a777e3 100%);
  padding: 2rem;
`;

const Header = styled.h1`
  color: white;
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
`;

interface StyledLayoutProps {
  children: React.ReactNode;
}

const StyledLayout: React.FC<StyledLayoutProps> = ({ children }) => {
  return (
    <PageContainer>
      <Header>Dashboard</Header>
      {children}
    </PageContainer>
  );
};

export default StyledLayout; 
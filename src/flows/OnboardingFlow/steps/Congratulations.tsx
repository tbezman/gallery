import { useCallback } from 'react';
import styled from 'styled-components';
import { Text, Subtitle, Title } from 'components/core/Text/Text';
import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';

function Congratulations() {
  const handleClick = useCallback(() => {
    alert(`ayyy lmao`);
  }, []);

  return (
    <StyledCongrats>
      <Title>Congratulations</Title>
      <Spacer height={8} />
      <StyledBodyText>Let's show your collection to the world.</StyledBodyText>
      <Spacer height={24} />
      <StyledButton text="Take me to my gallery" onClick={handleClick} />
    </StyledCongrats>
  );
}

const StyledCongrats = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const StyledBodyText = styled(Text)`
  color: ${colors.gray50};
  max-width: 400px;
  text-align: center;
`;

const StyledButton = styled(Button)`
  padding: 0px 24px;
`;

export default Congratulations;
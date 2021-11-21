import { useState, useCallback, useMemo } from 'react';
import { WizardContext } from 'react-albus';
import styled from 'styled-components';
import unescape from 'lodash.unescape';

import BigInput from 'components/core/BigInput/BigInput';
import { BodyRegular, BodyMedium } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import Button from 'components/core/Button/Button';
import { TextAreaWithCharCount } from 'components/core/TextArea/TextArea';
import ErrorText from 'components/core/Text/ErrorText';
import { useModal } from 'contexts/modal/ModalContext';
import formatError from 'errors/formatError';
import useUpdateCollectionInfo from 'hooks/api/collections/useUpdateCollectionInfo';
import { Collection, CollectionLayout } from 'types/Collection';
import useAuthenticatedGallery from 'hooks/api/galleries/useAuthenticatedGallery';
import useCreateCollection from 'hooks/api/collections/useCreateCollection';
import { useRefreshUnassignedNfts } from 'hooks/api/nfts/useUnassignedNfts';
import Mixpanel from 'utils/mixpanel';

type Props = {
  onNext: WizardContext['next'];
  collectionId?: Collection['id'];
  collectionName?: Collection['name'];
  collectionCollectorsNote?: Collection['collectors_note'];
  nftIds?: string[];
  layout?: CollectionLayout;
};

export const COLLECTION_DESCRIPTION_MAX_CHAR_COUNT = 300;

function CollectionCreateOrEditForm({
  onNext,
  collectionId,
  collectionName,
  collectionCollectorsNote,
  nftIds,
  layout,
}: Props) {
  const { hideModal } = useModal();

  const unescapedCollectionName = useMemo(() => unescape(collectionName), [collectionName]);
  const unescapedCollectorsNote = useMemo(() => unescape(collectionCollectorsNote), [collectionCollectorsNote]);

  const [title, setTitle] = useState(unescapedCollectionName ?? '');
  const [description, setDescription] = useState(unescapedCollectorsNote ?? '');

  // Generic error that doesn't belong to username / bio
  const [generalError, setGeneralError] = useState('');

  const handleNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target?.value);
  }, []);

  const handleDescriptionChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target?.value);
  }, []);

  const hasEnteredValue = useMemo(() => (title.length > 0) || (description.length > 0), [title, description]);

  const buttonText = useMemo(() => {
    // Collection is being created
    if (nftIds) {
      return 'create';
    }

    return hasEnteredValue ? 'save' : 'skip';
  }, [hasEnteredValue, nftIds]);

  const goToNextStep = useCallback(() => {
    onNext();
    hideModal();
  }, [onNext, hideModal]);

  const [isLoading, setIsLoading] = useState(false);

  const { id: galleryId } = useAuthenticatedGallery();
  const updateCollection = useUpdateCollectionInfo();
  const createCollection = useCreateCollection();

  const refreshUnassignedNfts = useRefreshUnassignedNfts();

  const handleClick = useCallback(async () => {
    setGeneralError('');

    if (description.length > COLLECTION_DESCRIPTION_MAX_CHAR_COUNT) {
      // No need to handle error here, since the form will mark the text as red
      return;
    }

    setIsLoading(true);
    try {
      // Collection is being updated
      if (collectionId) {
        await updateCollection(collectionId, title, description);
      }

      // Collection is being created
      if (!collectionId && nftIds && layout) {
        Mixpanel.track('Add Name & Description to collection', {
          'Added Name': title.length > 0,
          'Added description': description.length > 0,
        });
        await createCollection(galleryId, title, description, nftIds, layout);
      }

      // Refresh unassigned NFTs so that they're ready to go when the user returns to the create screen
      await refreshUnassignedNfts();

      goToNextStep();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setGeneralError(formatError(error));
      }
    }

    setIsLoading(false);
  }, [
    description,
    collectionId,
    nftIds,
    refreshUnassignedNfts,
    goToNextStep,
    updateCollection,
    title,
    createCollection,
    galleryId,
    layout
  ]);

  return (
    <StyledCollectionEditInfoForm>
      <BodyMedium>Give your collection a name and description</BodyMedium>
      <Spacer height={4} />
      <BodyRegular color={colors.gray50}>
        You can always add a collection name and description later.
      </BodyRegular>
      <Spacer height={16} />
      <BigInput
        onChange={handleNameChange}
        defaultValue={title}
        placeholder="Collection name"
        autoFocus
      />
      <Spacer height={24} />
      <StyledTextAreaWithCharCount
        onChange={handleDescriptionChange}
        placeholder="Tell us about your collection..."
        defaultValue={description}
        currentCharCount={description.length}
        maxCharCount={COLLECTION_DESCRIPTION_MAX_CHAR_COUNT}
      />
      {generalError && (
        <>
          <Spacer height={8} />
          <ErrorText message={generalError} />
        </>
      )}
      <Spacer height={20} />
      <ButtonContainer>
        <StyledButton
          mini
          text={buttonText}
          onClick={handleClick}
          disabled={isLoading}
          loading={isLoading}
        />
      </ButtonContainer>
    </StyledCollectionEditInfoForm>
  );
}

const StyledCollectionEditInfoForm = styled.div`
  display: flex;
  flex-direction: column;

  width: 480px;
`;

const StyledTextAreaWithCharCount = styled(TextAreaWithCharCount)`
  height: 144px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const StyledButton = styled(Button)`
  width: 90px;
`;

export default CollectionCreateOrEditForm;

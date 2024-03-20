/* eslint-disable no-unused-vars */
/* eslint-disable array-callback-return */
/* eslint-disable react/jsx-key */
import {  } from '@shopify/polaris';
import {
  reactExtension,
  BlockStack,
  View,
  
  
  Heading,
  Text,
  useApplyCartLinesChange,
  useCartLines,
  useSettings,
  Button,
  useStorage,
  useApi,
  useOrder,
  useCustomer,
  usePhone,
  useEmail,
  useCurrency,
} from '@shopify/ui-extensions-react/checkout';

// eslint-disable-next-line no-unused-vars
import { Checkbox, TextField,Choice,ChoiceList, Form } from '@shopify/ui-extensions/checkout';
import { useCallback, useEffect, useState } from 'react';
// Allow the attribution survey to display on the thank you page.
const thankYouBlock = reactExtension("purchase.thank-you.block.render", () => <Attribution />);
export { thankYouBlock };

const orderDetailsBlock = reactExtension("customer-account.order-status.block.render", () => <ProductReview />);
export { orderDetailsBlock };
const APP_URL ='https://cradle-forecasts-transmitted-barnes.trycloudflare.com';

function Attribution() {
  const [attribution, setAttribution] = useState('');
  const [loading, setLoading] = useState(false);
  const { sessionToken} = useApi();
  
 
  
  const [SurveyData, setSurveyData] = useState({});
  const [attributionSubmitted, setAttributionSubmitted] = useStorageState('attribution-submitted');

 
  
  
  useEffect(() => {

    async function FetchfromApisSurvey() {

      const token = await sessionToken.get();
      try {
        const response = await fetch(`${APP_URL}/api/survey`,
          {
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Erreur lors de  la récupération des sondages');
        }

        const surveyData = await response.json();
        setSurveyData(surveyData.surveys);
        //console.log('SurveyApi///* :', surveyData);



        return surveyData;
      } catch (error) {
        console.error('Erreur lors de la récupération des sondages :', error);
        // Gérer l'erreur ici ou la propager vers le haut
      }

    }
    FetchfromApisSurvey()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken])

  async function handleSubmit() {
    // Simulate a server request
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        // Send the review to the server
        console.log('Submitted:', attribution);
        setLoading(false);
        setAttributionSubmitted(true)
        resolve();
      }, 750)
    });
  }

  // Hides the survey if the attribution has already been submitted
  if (attributionSubmitted.loading || attributionSubmitted.data === true) {
    return null;
  }

  return (
    <>

      <Survey title="How did you hear about us?" surveyData={SurveyData} onSubmit={handleSubmit} loading={loading}>
        <ChoiceList
          name="sale-attribution"
          value={attribution}
          onChange={setAttribution}
        >
          <BlockStack>
            <Choice id="tv">TV</Choice>
            <Choice id="podcast">Podcast</Choice>
            <Choice id="family">From a friend or family member</Choice>
            <Choice id="tiktok">Tiktok</Choice>
          </BlockStack>
        </ChoiceList>
      </Survey>
      </>
  );
}
function Survey({
  title,
  description,
  onSubmit,
  children,
  loading,
  surveyData,
}) {
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    customer: {
      id: '',
      lastName: '',
      email: '',
      phone: '',
    },
    orderId: '',
    qst_rep: responses
  });
  
  const [reptext, settext] = useState('');
  const [{ data }, setStorage] = useStorageState('infoCustomer');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isResponseChanged, setResponseChanged] = useState(false);
  const [isvalid, setvalid] = useState(false);
  const { sessionToken } = useApi();
  
  const handleValidate = () => {
    setCustomerInfo((prevCustomerInfo) => ({
      ...prevCustomerInfo,
      customer: {
        ...prevCustomerInfo.customer,
        // Update customer fields if needed
      },
      qst_rep: responses
    }));
    
    
    console.log('customerInfo:', customerInfo);
    //console.log('responses:', responses);
    //setStorage(customerInfo);
    setvalid(true);
  };
  
  useEffect(() => {
    setStorage(customerInfo);
    console.log('data:', data);
  }, [customerInfo, data, setStorage]);
  
  const sendStorageToApi = async (storage) => {
    const token = await sessionToken.get();
    try {
      const response = await fetch(`${APP_URL}/api/getDataCustomer`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(storage)
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log(result);
      }
    } catch (e) {
      console.error('Erreur lors de la récupération des sondages :', e);
    }
  };

 // console.log('customerInfo/',customerInfo)
  const handleNextQuestion = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setResponseChanged(false)
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  async function handleSubmit() {
    // Soumettre l'ensemble des réponses
    await onSubmit(responses);
    sendStorageToApi(data);
    // Marquer comme soumis
    setSubmitted(true);
  }

  const handleResponseChange = (question_id, question, value) => {
    // Créer une copie des réponses actuelles
    const updatedResponses = [...responses];
  
    // Vérifier si la question a déjà une réponse dans les réponses existantes
    const existingResponseIndex = updatedResponses.findIndex(response => response.question === question);
  
    // Si oui, mettre à jour la réponse existante
    if (existingResponseIndex !== -1) {
      // Vérifier si la valeur est déjà présente dans la réponse existante
      const existingValues = updatedResponses[existingResponseIndex].response;
      if (existingValues.includes(value)) {
        // La valeur est déjà sélectionnée, la supprimer de la réponse
        const updatedValues = existingValues.filter(val => val !== value);
        if (updatedValues.length === 0) {
          // Si la réponse ne contient plus aucune valeur, la supprimer de la liste des réponses
          updatedResponses.splice(existingResponseIndex, 1);
        } else {
          // Mettre à jour la réponse existante avec les valeurs restantes
          updatedResponses[existingResponseIndex].response = updatedValues;
        }
      } else {
        // Ajouter la valeur à la réponse existante
        updatedResponses[existingResponseIndex].response.push(value);
      }
    } else {
      // Ajouter une nouvelle réponse avec la valeur sélectionnée
      updatedResponses.push({ question_id, question, response: [value] });
    }
  
    setResponseChanged(true);
    // Mettre à jour l'état des réponses
    setResponses(updatedResponses);
  };

//console.log(responses);
  if (submitted) {
    return (
      <View border="base" padding="base" borderRadius="base">
        <BlockStack>
          <Heading>Thanks for your feedback!</Heading>
          <Text>Your response has been submitted</Text>
        </BlockStack>
      </View>
    );
  }

  return (
    <>
      {surveyData.length > 0 ? (
        surveyData.map((surveyItem, index) => (
          <View key={index} border="base" padding="base" borderRadius="base">
            <BlockStack>
              <Heading variant="headingMd" tone="success" alignment="center" as="h1">{surveyItem.title}</Heading>
              <Text>{surveyItem.description}</Text>
              <View>
                <Heading>{surveyItem.questions[currentQuestionIndex].content}</Heading>
                {surveyItem.questions[currentQuestionIndex] ? (
                  (() => {
                    const responseItem = surveyItem.responses.find((response) =>
                      response.filteredResponses.some(
                        (filteredResponse) =>
                          filteredResponse.question_id === surveyItem.questions[currentQuestionIndex].question_id
                      )
                    );

                    return (
                      <>
                        <View>
  {surveyItem.questions[currentQuestionIndex].question_type === 'text' ? (
    <TextField value={reptext} onChange={(e) => handleResponseChange(surveyItem.questions[currentQuestionIndex].question_id,
      surveyItem.questions[currentQuestionIndex].content, e)} />
  ) : null}
  {surveyItem.questions[currentQuestionIndex].question_type === 'Radio' ? (
    <View key={index}>
     
      {responseItem.filteredResponses
        .filter((filteredResponse) => filteredResponse.question_id === surveyItem.questions[currentQuestionIndex].question_id)
        .map((filteredResponse, index) => (
          <ChoiceList  name="ship"
          key={filteredResponse.content}
          value="ship-1"
          onChange={(e) => {
            const content = filteredResponse.content;
            handleResponseChange(surveyItem.questions[currentQuestionIndex].question_id,
              surveyItem.questions[currentQuestionIndex].content,
               content);
          }}
          >
          <Choice
          //key={filteredResponse.content}
          value={''}
          id='5'
        >
          {filteredResponse.content}
        </Choice>
        </ChoiceList>
        
        ))}
        
    </View>
  ) : null}
  {surveyItem.questions[currentQuestionIndex].question_type === 'checkbox' ? (
    <View>
      {responseItem.filteredResponses
        .filter((filteredResponse) => filteredResponse.question_id === surveyItem.questions[currentQuestionIndex].question_id)
        .map((filteredResponse, index) => (
          <Checkbox
          key={filteredResponse.content}
          value={''}
          id='5'
          
          onChange={(e) => {
            const content = filteredResponse.content;
            handleResponseChange(surveyItem.questions[currentQuestionIndex].question_id 
              ,surveyItem.questions[currentQuestionIndex].content,
               content);
          }}
        >
          {filteredResponse.content}
        </Checkbox>
        
        ))}
    </View>
  ) : null}
</View>

                      </>
                    );
                  })()
                ) : null}
                <>
                <View>
  {/* Vos autres éléments */}
  {currentQuestionIndex === surveyItem.questions.length - 1 && (
    // eslint-disable-next-line no-undef
    <Button kind="secondary" onPress={handleValidate}>
  Valider
</Button>
  )}
</View>
<Button
  onclick={handleNextQuestion}
  kind="secondary"
  onPress={handleNextQuestion}
  disabled={currentQuestionIndex === surveyItem.questions.length - 1 || !isResponseChanged}
>
  Suivant
</Button>

                </>
              </View>
              <Button kind="secondary" onPress={handleSubmit} loading={loading}
               disabled={!isvalid}
              >
                Submit feedback
              </Button>
            </BlockStack>
          </View>
        ))
      ) : null}
    </>
  );
}

function ProductReview() {
  const [productReview, setProductReview] = useState('');
  const [loading, setLoading] = useState(false);
  // Store into local storage if the product was reviewed by the customer.
  const [productReviewed, setProductReviewed] = useStorageState('product-reviewed')
  const EMAIL=useEmail();
  const costumer=useCustomer();
  console.log('costumer :',costumer);
  console.log('EMAIL:',EMAIL);
 
  async function handleSubmit() {
    // Simulate a server request
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        // Send the review to the server
        console.log('Submitted:', productReview);
       ;
        setLoading(false);
        setProductReviewed(true);
        resolve();
      }, 750)
    });
  }

  // Hides the survey if the product has already been reviewed
  if (productReviewed.loading || productReviewed.data) {
    return null;
  }

  return (
    <Survey
      title="How do you like your purchase?"
      description="We would like to learn if you are enjoying your purchase."
      onSubmit={handleSubmit}
      loading={loading}
    >
      <ChoiceList
        name="product-review"
        value={productReview}
        onChange={setProductReview}
      >
        <BlockStack>
          <Choice id="5">Amazing! Very happy with it.</Choice>
          <Choice id="4">It's okay, I expected more.</Choice>
          <Choice id="3">Eh. There are better options out there.</Choice>
          <Choice id="2">I regret the purchase.</Choice>
        </BlockStack>
      </ChoiceList>
      
      
    </Survey>
  );
}


function useStorageState(key) {
  const storage = useStorage();
  const [data, setData] = useState()
  const [loading, setLoading] = useState(true)
  console.log(data);
  useEffect(() => {
    async function queryStorage() {
      const value = await storage.read(key)
      //console.log(value);
      setData(value);
    
      setLoading(false)
    }

    queryStorage();
  }, [setData, setLoading, storage, key])

  const setStorage = useCallback((value) => {
    storage.write(key, value)
  }, [storage, key])

  return [{ data, loading }, setStorage]
}

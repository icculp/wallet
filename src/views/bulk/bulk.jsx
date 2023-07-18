import { Button, IconSearch, TextInput } from "@pokt-foundation/ui";
import React, { useCallback, useEffect, useRef, useState } from "react";
import IconWithLabel from "../../components/iconWithLabel/iconWithLabel";
import Layout from "../../components/layout";
import { StakingContent } from "../../components/staking/content";
import { useUser } from "../../context/userContext";
import { getDataSource } from "../../datasource";
import IconQuestion from "../../icons/iconQuestion";
import BulkModal from "../bulk/bulkModal";
import { useHistory } from "react-router";
import { typeGuard } from "@pokt-network/pocket-js";
import ImportPocketContent from "../../components/import-pocket/content";
import Accordion from "../../components/accordion";
import IconUpload from "../../icons/iconUpload";
import PasswordInput from "../../components/input/passwordInput";
import Link from "../../components/link/link";
import {
  validationError,
  VALIDATION_ERROR_TYPES,
} from "../../utils/validations";
import TroubleConnectingModal from "../../components/modals/troubleConnecting/troubleConnecting";
import ExportExamplefile from "../../components/modals/export-examplefile/exportExamplefile";



const dataSource = getDataSource();

export default function Bulk() {
  const user = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectChainsOpen, setIsSelectChainsOpen] = useState(false);
  const [supportedChains, setSupportedChains] = useState([]);
  const [selectedChains, setSelectedChains] = useState([]);
  const [chainsToRender, setChainsToRender] = useState(supportedChains);
  const [error, setError] = useState("");
  const stakeData = useRef(null);
  const [nodesFile, setNodesFile] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [ppkError, setPpkError] = useState("");
  const [currentImportOption, setCurrentImportOption] = useState(undefined);
  const [troubleConnectingOpen, setTroubleConnectingOpen] = useState(false);
  const [useFileOutputAddress, setUseFileOutputAddress] = useState(false);
  const [isExportExamplefileVisible, setIsExportExamplefileVisible] = useState(false);
  

  const parseFileInputContent = async (input) => {
    if (input && input.files.length > 0) {
      const reader = new FileReader();
      const file = input.files[0];

      setFileName(file.name);

      return new Promise(function (resolve) {
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.onerror = (error) => {
          console.error(error);
          resolve(undefined);
        };
        reader.readAsText(file);
      });
    } else {
      return;
    }
  };


  const onFileUploadChange = async ({ target }) => {
    const fileInputValue = await parseFileInputContent(target);

    if (!fileInputValue) {
      setFileError("Error parsing node file contents.");
      return;
    }
    setFileError("");
    setFileName(fileInputValue.name);
    setNodesFile(fileInputValue);
  };


  // import button to validate nodes file and check balance + stake amount vs stake amount
  const importNodesFromFile = useCallback(async () => {
    try {
      const  file = fileName; //
    } catch (error) {
      setFileError(
        "There was an error importing your node File, please try again."
      );
      console.error(error);
    }
  }, [ ]);

 

  const onAccordionClick = useCallback(
    (option = -1) => {
      if (option === currentImportOption) {
        setCurrentImportOption(-1);
        return;
      }
      setCurrentImportOption(option);
    },
    [currentImportOption]
  );

  const onKeyPress = (e, onImport) => {
    const code = e?.keyCode || e?.which;
    if (code === 13) {
      onImport();
    }
  };



  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    // amount and output address from formdata, add to stakeData from nodes file upload

    if (selectedChains.length === 0) {
      setError("At least one chain must be selected");
      return;
    }

    if (selectedChains.length > 15) {
      //TODO: We need to have this value pulled from the "pos/MaximumChains" param instead of hardcoding
      setError("Only a maximum of 15 chains can be selected.");
      return;
    }

    stakeData.current = data;
    stakeData.nodesFile = nodesFile;
    setIsModalOpen(true);
    setError("");
  };

  const handleStake = (node) => {
    node.preventDefault();
    const formData = new FormData(node.target);
    const data = Object.fromEntries(formData);

    if (selectedChains.length === 0) {
      setError("At least one chain must be selected");
      return;
    }

    if (selectedChains.length > 15) {
      //TODO: We need to have this value pulled from the "pos/MaximumChains" param instead of hardcoding
      setError("Only a maximum of 15 chains can be selected.");
      return;
    }

    stakeData.current = data;
    setIsModalOpen(true);
    setError("");
  };

  const getSupportedChains = async () => {
    const supportedChains = await dataSource.getSupportedChains();
    if (!supportedChains) {
      setError("Error while fetching chains data.");
      return;
    }
    setError("");
    setSupportedChains(supportedChains);
    setChainsToRender(supportedChains);
  };

  const onChainChange = (e, chain) => {
    const {
      target: { checked },
    } = e;
    if (!checked) {
      setSelectedChains(
        selectedChains.filter((selectedChain) => selectedChain !== chain)
      );
      return;
    }

    if (selectedChains.length === 0) {
      setError("");
    }
    setSelectedChains((prev) => [...prev, chain]);
  };

  const onChainsSearch = (e) => {
    const {
      target: { value },
    } = e;

    if (value.length === 0) {
      setChainsToRender(supportedChains);
      //return;
    }

    const tempChains = [];

    for (const chain of supportedChains) {
      if (chain.toLowerCase().includes(value.toLowerCase())) {
        tempChains.push(chain);
      }
    }

    setChainsToRender(tempChains);
  };

  useEffect(() => {
    getSupportedChains();
  }, []);
  //from validations in util

const msgStake =     `{nodePubKey,\n
outputAddress,<br/>
chains,\n
amount,\n
serviceURI}`;

  return (
    

    <Layout title={<h1 className="title">Stake Bulk Nodes</h1>}>

      <ImportPocketContent hasFile={fileName ? true : false}>
      <Accordion
             text="Json Format Example"
             open={currentImportOption === 0}
             onClick={() => onAccordionClick(0)}
           >
         <div className="nimport-container">
            <p className="description">
              Import the nodes to be staked by uploading a csv with columns URI,Pubkey,Address,Chains
            </p>
            <Button
            className="export-keyfile"
            onClick={() => setIsExportExamplefileVisible(true)}
          >
            Export Examplefile
          </Button>
            https://node1.pokt.network:443,{user.user.publicKeyHex},{user.user.addressHex}, ["0001","0021"]
        </div>
          <br/>	<br/>	
            </Accordion>

            <ExportExamplefile
              visible={isExportExamplefileVisible}
              onClose={() => setIsExportExamplefileVisible(false)}
            />

         <div className="nimport-container">
           <Accordion
             text="Nodes File"
             open={currentImportOption === 1}
             onClick={() => onAccordionClick(1)}
           >
             <div className="error-label-container">
               <label
                 className="custom-file-input"
                 style={
                   ppkError
                     ? validationError(VALIDATION_ERROR_TYPES.input)
                     : undefined
                 }
               >
                 {fileName ? fileName : "Select File"}
                 <TextInput
                   adornment={<IconUpload color="white" />}
                   adornmentPosition="end"
                   type="file"
                   wide
                   className="upload-file-input"
                   onChange={onFileUploadChange}
                   accept=".csv"
               
              />
              
               </label>
               <IconWithLabel message={ppkError} show={ppkError} type="error" />

               
             </div>
           {/* <p className="create-link">
             Don't have a wallet? <Link to="/create">Create Wallet</Link>{" "}
           </p> */}
           {/* <Button
              mode="primary"
              className="import-button"
              onClick={importNodesFromFile}
            >
              Import
            </Button> */}
          </Accordion>
         </div>

       </ImportPocketContent>


       <TroubleConnectingModal
         open={troubleConnectingOpen}
         onClose={() => setTroubleConnectingOpen(false)}
       />
   


      <StakingContent>
        <form onSubmit={(e) => handleSubmit(e)}>
        <TextInput
            placeholder="Amount"
            name="amount"
            adornment={<span className="adornment">POKT</span>}
            adornmentPosition="end"
            required
          />
          {/* <IconQuestion /> */}

          <p className="description">
            The Output Address is the address that rewards will be sent to. You
            should only change this if you want rewards to go to a wallet that
            is different from this one.
          </p>
          <TextInput
            key="outputAddress"
            placeholder="Output Address"
            name="outputAddress"
            required
            defaultValue={user.user.addressHex}
            //disabled={useFileOutputAddress} // Disable the input when checkbox is checked
            />
            {/* <input
              type="checkbox"
              checked={useFileOutputAddress}
              onChange={(e) => setUseFileOutputAddress(e.target.checked)}
            />
            <label>Use Output Address from file</label> 
          <IconQuestion />*/}

        
          <br/><br/>
          <IconWithLabel message={error} show={error} type="error" />
          <Button className="stake" mode="primary" type="submit">
            Stake Node
          </Button>
        </form>
      </StakingContent>

      <BulkModal
        isOpen={isModalOpen}
        selectedChains={selectedChains}
        setIsOpen={setIsModalOpen}
        stakeData={stakeData}
      />
    </Layout>
  );
}

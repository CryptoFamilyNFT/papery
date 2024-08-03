import React, { ReactNode, useEffect } from "react";
import SolanaHelper from "./SolanaHelper";
import { SolanaContext } from "./SolanaContext";
import { ISolanaContext } from "./ISolanaContext";

const SolanaProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [context, setContext] = React.useState<ISolanaContext>({loaded: false, reload: true});

    const saveContext = (context: ISolanaContext) => {
      setContext(context);
    };

    useEffect(() => {
      // bind listeners
      SolanaHelper.connectErrorListener(onError);//TODO move to toast

      //init first time
      SolanaHelper.queryProviderInfo(context).then(c => saveContext({...c, loaded: true, isConnected: false}));

      return () => {// unmount
        SolanaHelper.disconnectListeners();
      }
    }, []);

    function onError(e:string){
      console.log("SolanaProvider.error: ", e)
    }

    function getToastDescription():ReactNode{
      return (
        <>
          <span>{context.toastDescription}</span>
          {/* {
            context.toastLink
              ?
                <Link gap={2} href={context.toastLink.url} isExternal={true}>
                  {context.toastLink.name} <ExternalLinkIcon mx={2} mb={1} />
                </Link>
              : <></>
          } */}
        </>
      );
    }

    return <SolanaContext.Provider value={{context, saveContext}}>{children}</SolanaContext.Provider>;
  };

  export default SolanaProvider;

import React, { useCallback, useEffect, useState } from "react";
import { useTheme } from "@pokt-foundation/ui";
import { Route, Switch, useLocation } from "react-router-dom";
import Home from "./home/index";
import Send from "./send/send";
import Create from "./create/createWallet";
import ImportPocket from "./import-pocket/importPocket";
import TransactionDetail from "./transaction-detail/transactionDetail";
import TransactionDetailBulk from "./transaction-detail/transactionDetailBulk";
import AccountDetail from "./account-detail/accountDetail";
import Header from "../components/header";
import Footer from "../components/footer";
import { ROUTES } from "../utils/routes";
import NonCustodial from "./non-custodial/nonCustodial";
import SelectAccount from "./select-account/selectAccount";
import Staking from "./staking/staking";
import Bulk from "./bulk/bulk";

export default function WalletRoutes() {
  const theme = useTheme();
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransistionStage] = useState("fadeIn");

  const onAnimationEnd = useCallback(() => {
    if (transitionStage === "fadeOut") {
      setTransistionStage("fadeIn");
      setDisplayLocation(location);
    }
  }, [location, transitionStage]);

  useEffect(() => {
    if (location !== displayLocation) setTransistionStage("fadeOut");
  }, [location, displayLocation]);

  return (
    <div
      style={{
        minWidth: "100vw",
        minHeight: "100vh",
        background: `linear-gradient(
            126.96deg,
            ${theme.backgroundGradient1} -5.41%,
            ${theme.backgroundGradient2} 101.86%
          )`,
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />
      <Switch location={displayLocation}>
        <div
          onAnimationEnd={onAnimationEnd}
          className={transitionStage}
          style={{
            minHeight: "100vh",
          }}
        >
          <Route exact path={ROUTES.home} component={Home}></Route>
          <Route exact path={ROUTES.import} component={ImportPocket}></Route>
          <Route exact path={ROUTES.create} component={Create}></Route>
          <Route exact path={ROUTES.selectAccount} component={SelectAccount}></Route>
          <Route exact path={ROUTES.send} component={Send}></Route>
          <Route exact path={ROUTES.account} component={AccountDetail}></Route>
          <Route exact path={ROUTES.txDetail} component={TransactionDetail}></Route>
          <Route exact path={ROUTES.txDetailBulk} component={TransactionDetailBulk}></Route>
          <Route exact path={ROUTES.nonCustodial} component={NonCustodial}></Route>
          <Route exact path={ROUTES.staking} component={Staking}></Route>
          <Route exact path={ROUTES.bulk} component={Bulk}></Route>
        </div>
      </Switch>
      <Footer />
    </div>
  );
}

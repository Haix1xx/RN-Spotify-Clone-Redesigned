import {
  CommonActions,
  NavigationContainerRef,
  Route,
  StackActions,
  TabActions,
} from "@react-navigation/native";
import React from "react";

export const navigation =
  React.createRef<NavigationContainerRef<ReactNavigation.RootParamList>>();

export function tabJumpTo<Params extends object>(
  routeName: string,
  params?: Params,
) {
  if (navigation.current)
    navigation.current?.dispatch(TabActions.jumpTo(routeName, params));
}

export function push<Params extends object>(
  routeName: string,
  params?: Params,
) {
  if (navigation.current) {
    navigation.current?.dispatch(StackActions.push(routeName, params));
  }
}

export function navigate<Params extends object>(
  routeName: string,
  params?: Params,
  callBack?: () => void,
) {
  if (navigation.current) {
    navigation.current?.dispatch(
      CommonActions.navigate({
        name: routeName,
        params,
      }),
    );
  }
  callBack && callBack();
}

export function goBack() {
  if (navigation.current?.canGoBack()) {
    navigation.current.dispatch(CommonActions.goBack());
  }
}

export function pop(value?: number) {
  navigation.current?.dispatch(StackActions.pop(value));
}

export function replace<Params extends object>(
  routeName: string,
  params?: Params,
) {
  if (navigation.current)
    navigation.current.dispatch(StackActions.replace(routeName, params));
}

export function reset(
  name: string,
  routes?: Omit<Route<string>, "key">[],
  index?: number,
) {
  if (navigation.current)
    navigation.current.dispatch(
      CommonActions.reset({
        index: index ?? 0,
        routes: routes
          ? routes
          : [
              {
                name: name,
              },
            ],
      }),
    );
}

export type NavState =
  | { screen: 'map' }
  | { screen: 'level'; levelId: string }

export type NavAction =
  | { type: 'openLevel'; levelId: string }
  | { type: 'backToMap' }

export const initialNav: NavState = { screen: 'map' }

export function navReducer(state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case 'openLevel':
      return { screen: 'level', levelId: action.levelId }
    case 'backToMap':
      return { screen: 'map' }
    default:
      return state
  }
}

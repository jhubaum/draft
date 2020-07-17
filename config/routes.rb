Rails.application.routes.draw do
  resources :drafts

  resources :urls do
    resources :highlights
  end

  root 'drafts#index'

  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end

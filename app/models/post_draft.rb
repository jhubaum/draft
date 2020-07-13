class PostDraft < ApplicationRecord
  has_many :urls, dependent: :destroy
end

class Url < ApplicationRecord
  belongs_to :post_draft
  has_many :highlights, dependent: :destroy
end

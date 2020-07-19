class Url < ApplicationRecord
  belongs_to :post_draft
  has_many :highlights, dependent: :destroy


  def dom_id
    return "url_" + self.url
  end
end

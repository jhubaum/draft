class CreateUrls < ActiveRecord::Migration[6.0]
  def change
    create_table :urls do |t|
      t.string :name
      t.string :url
      t.references :post_draft, null: false, foreign_key: true

      t.timestamps
    end
  end
end
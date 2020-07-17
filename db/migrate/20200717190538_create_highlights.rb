class CreateHighlights < ActiveRecord::Migration[6.0]
  def change
    create_table :highlights do |t|
      t.string :container
      t.integer :index
      t.integer :length
      t.string :type
      t.references :url, null: false, foreign_key: true

      t.timestamps
    end
  end
end

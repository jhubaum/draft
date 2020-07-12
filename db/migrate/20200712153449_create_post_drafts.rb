class CreatePostDrafts < ActiveRecord::Migration[6.0]
  def change
    create_table :post_drafts do |t|
      t.string :title
      t.text :body

      t.timestamps
    end
  end
end

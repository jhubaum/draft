class DraftsController < ApplicationController
  def index
    @drafts = PostDraft.all
  end

  def create
    @draft = PostDraft.new draft_params

    respond_to do |format|
      if @draft.save
        format.js { }
      end
    end
  end

  def destroy
    @draft = PostDraft.find(params[:id])
    @draft.destroy

    respond_to do |format|
      format.js { }
    end
  end

  private
    def draft_params
      params.require(:draft).permit(:title, :body)
    end
end

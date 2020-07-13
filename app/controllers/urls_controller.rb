class UrlsController < ApplicationController
  def show
    @draft = PostDraft.find(params[:draft_id])
    @url = @draft.urls.find(params[:id])
  end

  def create
    @draft = PostDraft.find(params[:draft_id])
    @url = @draft.urls.create(url_params) do |u|
      u.url = new_url_string
    end

    respond_to do |format|
      if @url.save
        format.js { }
      end
    end
  end

  private
    def new_url_string
      url = SecureRandom.hex 4

      while Url.find_by(url: url)
        url = SecureRandom.hex 4
      end

      url
    end

    def url_params
      params.require(:url).permit(:draft_id, :name)
    end
end

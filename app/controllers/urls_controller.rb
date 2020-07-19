class UrlsController < ApplicationController
  def show
    @url = Url.find(params[:id])
    @draft = url.post_draft
  end

  def create
    @draft = PostDraft.find(params[:url][:draft_id])
    params[:url] = params[:url].except(:draft_id)
    @url = @draft.urls.create(url_params) do |u|
      u.url = new_url_string
    end

    respond_to do |format|
      if @url.save
        format.js { }
      end
    end
  end

  def destroy
    @url = Url.find(params[:id])

    @url.destroy

    respond_to do |format|
      format.js
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
      params.require(:url).permit(:name)
    end
end

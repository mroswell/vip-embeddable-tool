require 'rubygems'
require 'bundler/setup'
require 'rspec'
require 'capybara/rspec'
require 'capybara/poltergeist'

Capybara.configure do |config|
  config.default_driver = :poltergeist
  config.run_server = false
  config.app_host = 'http://169.254.67.250:3002'
end

describe "App" do
  include Capybara::DSL

  before(:each) do
    visit('/')
  end

  describe "/", :js => true do
    it "when clicking submit" do
      find("#current-location").click
      expect(page).to have_content "Your Closest Polling Location"
    end
  end

  describe "/mapView" do
    it "when clicking back" do
      find("#current-location").click
      find("#change-your-address").click
      expect(page).to have_content "Voter Information"
    end
  end
end
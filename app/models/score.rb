class Score < ActiveRecord::Base
  attr_accessible :name, :time
  validates :name, :presence => true
  
end

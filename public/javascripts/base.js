$(document).ready(function() {
	
	
	$('.playlistThumb').mouseenter(function() {
		
		var tracks = JSON.parse($(this).attr('tracks'));
		var playlistInfo = $("<div class='playlistInfo'><ol></ol></div>");
		for(var i = 0; i < tracks.length; i++){
			var track = tracks[i];
			if(i != tracks.length-1) playlistInfo.find('ol').append("<li>"+track.title+"</li>")
			else playlistInfo.find('ol').append("<li class='last'>"+track.title+"</li>")
		}
		$("body").append(playlistInfo);
		playlistInfo.fadeIn(200);
		
		$(this).mousemove(function(e) {
			var top = e.pageY,
					left = e.pageX+10;
			$('.playlistInfo').css({
				'top': top,
				'left': left
			})
		});
		
		$(this).mouseleave(function() {
			$('.playlistInfo').fadeOut(400, function() {
				$('.playlistInfo').remove();
			});
		});
	})
	
	
});
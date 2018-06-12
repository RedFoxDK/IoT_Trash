<?php
header('Content-Type: application/json');
class IoT_Trash
{
	private $url = "THE URL TO THE SERVER";
	
	private function get_data() 
	{
		if (file_get_contents('php://input')) {
			return json_decode(file_get_contents('php://input'));
		} else {
			return NULL;
		}
	}	
	
	private function send_get($path)
	{
		$curl = curl_init();
		$add = $this->url . $path;
		curl_setopt($curl, CURLOPT_URL, $add);
		curl_setopt($curl, CURLOPT_ENCODING, "UTF-8" );
		curl_setopt($curl, CURLINFO_HEADER_OUT, true);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		$data = curl_exec($curl);
		curl_close($curl);
		
		echo $data;
	}
	
	private function send_post($path, $data) 
	{
		$add = $this->url . $path;
		
		$curl = curl_init();
		curl_setopt($curl, CURLOPT_URL, $add);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_POST, 1);
		curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
		curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
		$response = curl_exec($curl);
		curl_close($curl);
		echo $response;
		
	}
	
	public function __construct() 
	{
		$data = json_encode($this->get_data());
		$got_path = $_GET["sti"];
		$met = $_GET["met"];
		
		switch($met) {
			case "GET":
				$this->send_get($got_path);
				break;
			case "POST":
				$this->send_post($got_path, $data);
				break;
		}
	}
}

$start = new IoT_Trash();
?>
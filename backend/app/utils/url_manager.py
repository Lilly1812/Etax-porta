class URLStateManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(URLStateManager, cls).__new__(cls)
            cls._instance._current_url = ""
        return cls._instance

    @property
    def current_url(self) -> str:
        return self._current_url

    @current_url.setter
    def current_url(self, url: str):
        if not isinstance(url, str):
            raise ValueError("URL must be a string")
        self._current_url = url

    def clear(self):
        self._current_url = ""